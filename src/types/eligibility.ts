export type RuleStatus = 'satisfied' | 'failed' | 'missing_info' | 'warning';

export interface RuleEvaluation {
  id: string;
  name: string; // e.g. "Annual Family Income Ceiling"
  criterionDescription: string; // e.g. "Family income must be below ₹2,50,000 / yr"
  userValueDescription: string; // e.g. "Your declared family income is ₹1,80,000 / yr"
  status: RuleStatus;
  importance: 'mandatory' | 'preferred';
  failureExplanation?: string;
}

export type OverallEligibility = 'eligible' | 'conditionally_eligible' | 'ineligible';

export interface EligibilityResult {
  scholarshipId: string;
  status: OverallEligibility;
  matchScore: number; // 0 - 100
  satisfiedRules: RuleEvaluation[];
  failedRules: RuleEvaluation[];
  missingInfoRules: RuleEvaluation[];
  summaryMessage: string;
  recommendations: string[];
}
