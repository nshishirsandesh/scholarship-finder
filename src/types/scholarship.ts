export type EducationLevel =
  | 'Class 10'
  | 'Class 11'
  | 'Class 12'
  | 'Diploma'
  | 'Undergraduate'
  | 'Postgraduate'
  | 'Doctorate';

export type Category = 'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';

export type Religion =
  | 'Hindu'
  | 'Muslim'
  | 'Christian'
  | 'Sikh'
  | 'Buddhist'
  | 'Jain'
  | 'Parsi'
  | 'Other';

export type Gender = 'Female' | 'Male' | 'Transgender / Other' | 'All';

export type ProviderType =
  | 'Central Government'
  | 'State Government'
  | 'Corporate CSR'
  | 'Private Foundation'
  | 'Trust / NGO';

export type ApplicationStatus = 'Open' | 'Upcoming' | 'Closed' | 'Unconfirmed';

export interface ScholarshipCriteria {
  minPercentage?: number; // 0 - 100
  maxAnnualIncome?: number; // In INR, e.g., 250000, 450000, 800000
  eligibleLevels: (EducationLevel | 'ALL')[];
  eligibleCourses?: string[]; // e.g. ['B.Tech', 'MBBS', 'B.Sc', 'ALL']
  eligibleStates: (string | 'ALL')[]; // e.g. ['Karnataka', 'ALL']
  eligibleCategories: (Category | 'ALL')[];
  eligibleGenders: Gender[];
  eligibleReligions?: (Religion | 'ALL')[];
  pwdOnly?: boolean;
  minDisabilityPercentage?: number;
  singleGirlChildOnly?: boolean;
  firstGenerationGraduateOnly?: boolean;
  defenseWardOnly?: boolean;
  instituteTypes?: ('Central Govt' | 'State Govt' | 'Govt-Aided' | 'Private / Deemed' | 'ALL')[];
}

export interface OfficialSource {
  portalName: string;
  officialUrl: string; // Official scheme information / guideline page
  applicationUrl?: string | null; // Direct official application / login portal if confirmed
  isApplicationUrlVerified: boolean;
  issuingAuthority: string;
  isVerified: boolean;
  lastVerifiedDate: string; // e.g., "October 2026"
  notes?: string;
}

export interface DeadlineInfo {
  type: 'fixed' | 'tentative' | 'rolling';
  status: ApplicationStatus;
  closingDate?: string; // ISO string e.g. "2026-11-30"
  openingDate?: string;
  cycleDescription: string;
  notificationPeriod?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  shortDescription: string;
  overview: string;
  provider: string;
  providerType: ProviderType;
  awardAmount: {
    maxAmountPerYear: number; // In INR
    formatted: string; // e.g., "₹50,000 / year"
    type: 'per_year' | 'one_time' | 'full_tuition_and_allowance';
    feeWaiverPercentage?: number;
  };
  criteria: ScholarshipCriteria;
  requiredDocuments: string[]; // Standard document IDs
  source: OfficialSource;
  deadline: DeadlineInfo;
  tags: string[];
  selectionProcess: string;
  renewalConditions?: string;
  contactSupport?: string;
}
