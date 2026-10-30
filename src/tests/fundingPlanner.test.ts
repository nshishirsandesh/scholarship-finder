import { describe, it, expect } from 'vitest';
import { calculateFundingPlan } from '../engine/fundingPlanner';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { DEMO_PERSONAS } from '../data/personas';
import { UserProfile } from '../types/user';

describe('Educational Funding Planner', () => {
  const ananyaProfile: UserProfile = {
    ...DEMO_PERSONAS[0].profile,
    uid: 'funding_test_user',
    updatedAt: new Date().toISOString(),
    aspirations: {
      ...DEMO_PERSONAS[0].profile.aspirations,
      estimatedAnnualTuitionCost: 80000,
      estimatedAnnualLivingCost: 50000,
    },
  };

  it('accurately computes total annual expenses and net funding gap', () => {
    const plan = calculateFundingPlan(ananyaProfile, SCHOLARSHIPS_DATA);

    expect(plan.totalAnnualExpense).toBe(130000); // 80k + 50k
    expect(plan.potentialTotalAid).toBeGreaterThan(0);
    expect(plan.realisticExpectedAid).toBeGreaterThan(0);
    expect(plan.coveragePercentage).toBeGreaterThanOrEqual(0);
    expect(plan.coveragePercentage).toBeLessThanOrEqual(100);
    expect(plan.policyExplanation).toContain('Indian Government');
    expect(plan.recommendations.length).toBeGreaterThan(0);
  });
});
