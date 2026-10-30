import { Scholarship } from '../types/scholarship';
import { UserProfile } from '../types/user';
import { evaluateEligibility } from './eligibilityEngine';

export interface FundingBreakdown {
  annualTuitionCost: number;
  annualLivingCost: number;
  totalAnnualExpense: number;

  potentialTotalAid: number;
  realisticExpectedAid: number;
  netFundingGap: number;
  coveragePercentage: number;

  bestGovernmentScholarship?: {
    name: string;
    amount: number;
  };
  bestCsrScholarship?: {
    name: string;
    amount: number;
  };

  policyExplanation: string;
  recommendations: string[];
}

export function calculateFundingPlan(
  profile: UserProfile,
  allScholarships: Scholarship[]
): FundingBreakdown {
  const tuition = profile.aspirations.estimatedAnnualTuitionCost || 65000;
  const living = profile.aspirations.estimatedAnnualLivingCost || 45000;
  const totalExpense = tuition + living;

  const eligibleGovt: { name: string; amount: number }[] = [];
  const eligibleCsr: { name: string; amount: number }[] = [];

  let potentialSum = 0;

  for (const s of allScholarships) {
    const res = evaluateEligibility(s, profile);
    if (res.status === 'eligible') {
      const amt = s.awardAmount.maxAmountPerYear;
      potentialSum += amt;

      if (s.providerType === 'Central Government' || s.providerType === 'State Government') {
        eligibleGovt.push({ name: s.name, amount: amt });
      } else {
        eligibleCsr.push({ name: s.name, amount: amt });
      }
    }
  }

  // Sort descending by amount
  eligibleGovt.sort((a, b) => b.amount - a.amount);
  eligibleCsr.sort((a, b) => b.amount - a.amount);

  const bestGovt = eligibleGovt[0];
  const bestCsr = eligibleCsr[0];

  const govtAmount = bestGovt ? bestGovt.amount : 0;
  const csrAmount = bestCsr ? bestCsr.amount : 0;

  // Realistic combined expected aid
  const realisticAid = Math.min(totalExpense, govtAmount + csrAmount);
  const netGap = Math.max(0, totalExpense - realisticAid);
  const coveragePct = totalExpense > 0 ? Math.min(100, Math.round((realisticAid / totalExpense) * 100)) : 0;

  const recommendations: string[] = [];

  if (coveragePct >= 100) {
    recommendations.push('Your estimated expenses are fully covered by your top matched scholarships! Focus on maintaining high marks for renewal.');
  } else if (coveragePct >= 60) {
    recommendations.push(`Your top matches cover ${coveragePct}% of your expenses. For the remaining ₹${netGap.toLocaleString('en-IN')}, check if your college offers institutional fee concessions.`);
  } else {
    recommendations.push(`A funding gap of ₹${netGap.toLocaleString('en-IN')} remains. Consider applying for state interest-subsidized education loans via the government Vidya Lakshmi portal (vidyalakshmi.co.in).`);
    recommendations.push('Explore college alumni emergency funds and local community trust grants.');
  }

  return {
    annualTuitionCost: tuition,
    annualLivingCost: living,
    totalAnnualExpense: totalExpense,
    potentialTotalAid: potentialSum,
    realisticExpectedAid: realisticAid,
    netFundingGap: netGap,
    coveragePercentage: coveragePct,
    bestGovernmentScholarship: bestGovt,
    bestCsrScholarship: bestCsr,
    policyExplanation:
      'Indian Government regulations stipulate that students cannot draw concurrent maintenance allowances from two central/state schemes. However, combining one government fee-reimbursement scheme with one private/CSR merit grant is widely permitted.',
    recommendations,
  };
}
