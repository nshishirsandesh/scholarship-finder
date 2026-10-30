import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from '../engine/eligibilityEngine';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { DEMO_PERSONAS } from '../data/personas';
import { UserProfile } from '../types/user';

describe('Deterministic Eligibility Engine', () => {
  const ananyaProfile: UserProfile = {
    ...DEMO_PERSONAS[0].profile,
    uid: 'test_ananya',
    updatedAt: new Date().toISOString(),
  };

  const aictePragati = SCHOLARSHIPS_DATA.find(s => s.id === 'aicte-pragati')!;
  const postMatricSc = SCHOLARSHIPS_DATA.find(s => s.id === 'post-matric-sc')!;
  const karnatakaSsp = SCHOLARSHIPS_DATA.find(s => s.id === 'karnataka-ssp')!;
  const centralSector = SCHOLARSHIPS_DATA.find(s => s.id === 'nsp-csss')!;

  it('correctly evaluates 100% eligibility for AICTE Pragati for female B.Tech student with income < 8L', () => {
    const result = evaluateEligibility(aictePragati, ananyaProfile);
    expect(result.status).toBe('eligible');
    expect(result.matchScore).toBe(100);
    expect(result.failedRules.length).toBe(0);
    expect(result.satisfiedRules.some(r => r.id === 'gender')).toBe(true);
  });

  it('fails gender criteria when evaluating AICTE Pragati for a male student', () => {
    const maleProfile: UserProfile = {
      ...ananyaProfile,
      financialAndCategory: {
        ...ananyaProfile.financialAndCategory,
        gender: 'Male',
      },
    };
    const result = evaluateEligibility(aictePragati, maleProfile);
    expect(result.status).toBe('ineligible');
    const genderRule = result.failedRules.find(r => r.id === 'gender');
    expect(genderRule).toBeDefined();
    expect(genderRule?.status).toBe('failed');
  });

  it('strictly enforces family income ceiling boundary conditions', () => {
    // Post-Matric SC income limit is ₹2,50,000
    const scProfileUnderLimit: UserProfile = {
      ...ananyaProfile,
      financialAndCategory: {
        ...ananyaProfile.financialAndCategory,
        category: 'SC',
        annualFamilyIncome: 250000, // Exactly at ceiling
      },
    };
    const passResult = evaluateEligibility(postMatricSc, scProfileUnderLimit);
    expect(passResult.satisfiedRules.some(r => r.id === 'income')).toBe(true);

    const scProfileOverLimit: UserProfile = {
      ...ananyaProfile,
      financialAndCategory: {
        ...ananyaProfile.financialAndCategory,
        category: 'SC',
        annualFamilyIncome: 250001, // ₹1 over ceiling
      },
    };
    const failResult = evaluateEligibility(postMatricSc, scProfileOverLimit);
    expect(failResult.failedRules.some(r => r.id === 'income')).toBe(true);
    expect(failResult.status).toBe('ineligible');
  });

  it('correctly validates state domicile restriction for Karnataka SSP', () => {
    // Ananya is from Karnataka
    const karnatakaResult = evaluateEligibility(karnatakaSsp, ananyaProfile);
    expect(karnatakaResult.satisfiedRules.some(r => r.id === 'domicile')).toBe(true);

    // Profile from Maharashtra
    const nonKarnatakaProfile: UserProfile = {
      ...ananyaProfile,
      location: {
        ...ananyaProfile.location,
        state: 'Maharashtra',
      },
    };
    const foreignResult = evaluateEligibility(karnatakaSsp, nonKarnatakaProfile);
    expect(foreignResult.failedRules.some(r => r.id === 'domicile')).toBe(true);
    expect(foreignResult.status).toBe('ineligible');
  });

  it('flags missing information as conditionally eligible when academic marks are omitted', () => {
    const profileWithoutMarks: UserProfile = {
      ...ananyaProfile,
      academic: {
        ...ananyaProfile.academic,
        class12Percentage: undefined,
        currentPercentageOrCgpa: undefined,
        class10Percentage: undefined,
      },
    };
    // Central Sector Scheme requires minPercentage 80
    const result = evaluateEligibility(centralSector, profileWithoutMarks);
    expect(result.missingInfoRules.some(r => r.id === 'marks')).toBe(true);
    expect(result.status).toBe('conditionally_eligible');
  });
});
