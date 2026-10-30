import { Scholarship } from '../types/scholarship';
import { UserProfile } from '../types/user';
import { evaluateEligibility } from './eligibilityEngine';

export interface ProfileGap {
  id: string;
  field: string;
  title: string;
  description: string;
  potentialUnlockCount: number;
  actionStep: string;
}

export interface ProfileUpdateImpact {
  newlyUnlockedScholarships: Scholarship[];
  summaryMessage: string;
  hasPositiveImpact: boolean;
}

export function detectMissingProfileGaps(
  profile: UserProfile,
  allScholarships: Scholarship[]
): ProfileGap[] {
  const gaps: ProfileGap[] = [];

  // Check 1: Missing Class 12 percentage
  if (!profile.academic.class12Percentage && !profile.academic.currentPercentageOrCgpa) {
    const meritCount = allScholarships.filter(s => s.criteria.minPercentage !== undefined).length;
    gaps.push({
      id: 'gap_marks',
      field: 'academic.class12Percentage',
      title: 'Missing Academic Percentage',
      description: 'Enter your Class 12 or current degree percentage to enable merit evaluation.',
      potentialUnlockCount: meritCount,
      actionStep: 'Add your Class 12 % in Profile > Academic',
    });
  }

  // Check 2: Missing or default state
  if (!profile.location.state) {
    const stateSpecificCount = allScholarships.filter(s => !s.criteria.eligibleStates.includes('ALL')).length;
    gaps.push({
      id: 'gap_state',
      field: 'location.state',
      title: 'State Domicile Not Specified',
      description: 'Specifying your home state unlocks state government scholarships and regional fee waivers.',
      potentialUnlockCount: stateSpecificCount,
      actionStep: 'Select your home State in Profile > Location',
    });
  }

  // Check 3: Check institution type
  if (!profile.academic.institutionType) {
    const instCount = allScholarships.filter(s => s.criteria.instituteTypes && !s.criteria.instituteTypes.includes('ALL')).length;
    gaps.push({
      id: 'gap_inst_type',
      field: 'academic.institutionType',
      title: 'Institution Accreditation',
      description: 'Government engineering and aided colleges have exclusive corporate partnership grants (e.g. Siemens).',
      potentialUnlockCount: instCount,
      actionStep: 'Specify whether your college is Govt or Aided',
    });
  }

  return gaps;
}

export function evaluateProfileUpdateImpact(
  previousProfile: UserProfile | null,
  currentProfile: UserProfile,
  allScholarships: Scholarship[]
): ProfileUpdateImpact {
  if (!previousProfile) {
    return {
      newlyUnlockedScholarships: [],
      summaryMessage: '',
      hasPositiveImpact: false,
    };
  }

  const newlyUnlocked: Scholarship[] = [];

  for (const scholarship of allScholarships) {
    const prevEval = evaluateEligibility(scholarship, previousProfile);
    const currEval = evaluateEligibility(scholarship, currentProfile);

    // If it was ineligible before and is now eligible or conditionally eligible
    if (prevEval.status === 'ineligible' && (currEval.status === 'eligible' || currEval.status === 'conditionally_eligible')) {
      newlyUnlocked.push(scholarship);
    }
  }

  if (newlyUnlocked.length > 0) {
    const names = newlyUnlocked.slice(0, 2).map(s => s.name).join(', ');
    const moreCount = newlyUnlocked.length > 2 ? ` and ${newlyUnlocked.length - 2} more` : '';
    return {
      newlyUnlockedScholarships: newlyUnlocked,
      summaryMessage: `Updating your profile unlocked ${newlyUnlocked.length} new scholarship(s), including ${names}${moreCount}!`,
      hasPositiveImpact: true,
    };
  }

  return {
    newlyUnlockedScholarships: [],
    summaryMessage: 'Profile updated successfully.',
    hasPositiveImpact: false,
  };
}
