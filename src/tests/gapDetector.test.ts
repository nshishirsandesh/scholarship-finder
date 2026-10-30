import { describe, it, expect } from 'vitest';
import { detectMissingProfileGaps, evaluateProfileUpdateImpact } from '../engine/gapDetector';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { DEMO_PERSONAS } from '../data/personas';
import { UserProfile } from '../types/user';

describe('Profile Gap & Reactive Unlock Detector', () => {
  const baseProfile: UserProfile = {
    ...DEMO_PERSONAS[0].profile,
    uid: 'gap_test_user',
    updatedAt: new Date().toISOString(),
  };

  it('detects missing marks when not filled by student', () => {
    const profileNoMarks: UserProfile = {
      ...baseProfile,
      academic: {
        ...baseProfile.academic,
        class12Percentage: undefined,
        currentPercentageOrCgpa: undefined,
      },
    };

    const gaps = detectMissingProfileGaps(profileNoMarks, SCHOLARSHIPS_DATA);
    expect(gaps.some(g => g.id === 'gap_marks')).toBe(true);
  });

  it('detects newly unlocked scholarships when income is updated downwards', () => {
    const highIncomeProfile: UserProfile = {
      ...baseProfile,
      financialAndCategory: {
        ...baseProfile.financialAndCategory,
        annualFamilyIncome: 900000, // Income 9L disqualified for Pragati and CSSS
      },
    };

    const updatedLowerIncomeProfile: UserProfile = {
      ...baseProfile,
      financialAndCategory: {
        ...baseProfile.financialAndCategory,
        annualFamilyIncome: 200000, // Income 2L qualifies
      },
    };

    const impact = evaluateProfileUpdateImpact(highIncomeProfile, updatedLowerIncomeProfile, SCHOLARSHIPS_DATA);
    expect(impact.hasPositiveImpact).toBe(true);
    expect(impact.newlyUnlockedScholarships.length).toBeGreaterThan(0);
    expect(impact.summaryMessage).toContain('unlocked');
  });
});
