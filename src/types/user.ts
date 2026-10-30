import { Category, EducationLevel, Gender, Religion } from './scholarship';

export interface AcademicProfile {
  level: EducationLevel;
  course: string; // e.g. "B.Tech Computer Science", "MBBS", "Class 12 Science"
  currentYear: string; // "1st Year", "2nd Year", "3rd Year", "Final Year"
  institutionName: string;
  institutionType: 'Central Govt' | 'State Govt' | 'Govt-Aided' | 'Private / Deemed';
  class10Percentage?: number;
  class12Percentage?: number;
  currentPercentageOrCgpa?: number; // Normalized to 0-100 or CGPA
}

export interface LocationProfile {
  state: string; // Indian State or UT
  district: string;
  areaType: 'Rural' | 'Semi-Urban' | 'Urban';
}

export interface FinancialAndCategoryProfile {
  annualFamilyIncome: number; // In INR e.g. 180000
  category: Category;
  religion: Religion;
  gender: 'Female' | 'Male' | 'Transgender / Other';
  isPwd: boolean;
  pwdPercentage?: number; // e.g. 40
  isSingleGirlChild: boolean;
  isFirstGenerationGraduate: boolean;
  isWardOfDefenseOrExServicemen: boolean;
  isWardOfFarmer: boolean;
}

export interface AspirationsProfile {
  fieldsOfInterest: string[];
  intendsToStudyAbroad: boolean;
  financialUrgency: 'High' | 'Moderate' | 'Standard';
  estimatedAnnualTuitionCost: number; // In INR
  estimatedAnnualLivingCost: number; // In INR
}

export interface UserProfile {
  uid: string;
  phoneNumber?: string;
  fullName: string;
  academic: AcademicProfile;
  location: LocationProfile;
  financialAndCategory: FinancialAndCategoryProfile;
  aspirations: AspirationsProfile;
  isOnboardingCompleted: boolean;
  updatedAt: string;
}

export interface DemoPersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  profile: Omit<UserProfile, 'uid' | 'updatedAt'>;
}
