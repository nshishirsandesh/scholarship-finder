import { Scholarship } from '../types/scholarship';
import { UserProfile } from '../types/user';
import { EligibilityResult, RuleEvaluation, OverallEligibility } from '../types/eligibility';

export function evaluateEligibility(
  scholarship: Scholarship,
  profile: UserProfile
): EligibilityResult {
  const satisfied: RuleEvaluation[] = [];
  const failed: RuleEvaluation[] = [];
  const missing: RuleEvaluation[] = [];

  const { criteria } = scholarship;
  const { academic, location, financialAndCategory } = profile;

  // 1. Education Level Rule
  if (criteria.eligibleLevels.includes('ALL') || criteria.eligibleLevels.includes(academic.level)) {
    satisfied.push({
      id: 'level',
      name: 'Education Level',
      criterionDescription: `Open for ${criteria.eligibleLevels.join(', ')}`,
      userValueDescription: `Your level: ${academic.level}`,
      status: 'satisfied',
      importance: 'mandatory',
    });
  } else {
    failed.push({
      id: 'level',
      name: 'Education Level',
      criterionDescription: `Eligible levels: ${criteria.eligibleLevels.join(', ')}`,
      userValueDescription: `Your current level is ${academic.level}`,
      status: 'failed',
      importance: 'mandatory',
      failureExplanation: `This scheme is not open to ${academic.level} students.`,
    });
  }

  // 2. Annual Family Income Ceiling Rule
  if (criteria.maxAnnualIncome !== undefined) {
    const formattedMax = `₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}`;
    const userIncome = financialAndCategory.annualFamilyIncome;
    const formattedUser = `₹${userIncome.toLocaleString('en-IN')}`;

    if (userIncome <= criteria.maxAnnualIncome) {
      satisfied.push({
        id: 'income',
        name: 'Family Income Ceiling',
        criterionDescription: `Annual family income must be ≤ ${formattedMax}`,
        userValueDescription: `Your family income is ${formattedUser}`,
        status: 'satisfied',
        importance: 'mandatory',
      });
    } else {
      failed.push({
        id: 'income',
        name: 'Family Income Ceiling',
        criterionDescription: `Annual family income must not exceed ${formattedMax}`,
        userValueDescription: `Your family income is ${formattedUser} (exceeds by ₹${(userIncome - criteria.maxAnnualIncome).toLocaleString('en-IN')})`,
        status: 'failed',
        importance: 'mandatory',
        failureExplanation: `Exceeds the maximum family income limit of ${formattedMax} set by the authority.`,
      });
    }
  }

  // 3. Gender Requirement Rule
  const isGenderMatched =
    criteria.eligibleGenders.includes('All') ||
    criteria.eligibleGenders.includes(financialAndCategory.gender as any);

  if (isGenderMatched) {
    satisfied.push({
      id: 'gender',
      name: 'Gender Criteria',
      criterionDescription: `Eligible: ${criteria.eligibleGenders.join(', ')}`,
      userValueDescription: `Your gender: ${financialAndCategory.gender}`,
      status: 'satisfied',
      importance: 'mandatory',
    });
  } else {
    failed.push({
      id: 'gender',
      name: 'Gender Criteria',
      criterionDescription: `Specifically restricted to: ${criteria.eligibleGenders.join(', ')}`,
      userValueDescription: `Your gender is ${financialAndCategory.gender}`,
      status: 'failed',
      importance: 'mandatory',
      failureExplanation: `This scholarship is exclusively reserved for ${criteria.eligibleGenders.join(', ')} students.`,
    });
  }

  // 4. Social Category & Reservation Rule
  const isCategoryMatched =
    criteria.eligibleCategories.includes('ALL') ||
    criteria.eligibleCategories.includes(financialAndCategory.category);

  if (isCategoryMatched) {
    satisfied.push({
      id: 'category',
      name: 'Social Category',
      criterionDescription: `Eligible: ${criteria.eligibleCategories.join(', ')}`,
      userValueDescription: `Your category: ${financialAndCategory.category}`,
      status: 'satisfied',
      importance: 'mandatory',
    });
  } else {
    failed.push({
      id: 'category',
      name: 'Social Category',
      criterionDescription: `Restricted to: ${criteria.eligibleCategories.join(', ')}`,
      userValueDescription: `Your category is ${financialAndCategory.category}`,
      status: 'failed',
      importance: 'mandatory',
      failureExplanation: `Scheme is designated specifically for ${criteria.eligibleCategories.join(', ')} candidates.`,
    });
  }

  // 5. State / Domicile Rule
  const isStateMatched =
    criteria.eligibleStates.includes('ALL') ||
    criteria.eligibleStates.includes(location.state);

  if (isStateMatched) {
    satisfied.push({
      id: 'domicile',
      name: 'Domicile / State Residence',
      criterionDescription: `Applicable in: ${criteria.eligibleStates.join(', ')}`,
      userValueDescription: `Your state: ${location.state}`,
      status: 'satisfied',
      importance: 'mandatory',
    });
  } else {
    failed.push({
      id: 'domicile',
      name: 'Domicile / State Residence',
      criterionDescription: `Restricted to permanent residents of: ${criteria.eligibleStates.join(', ')}`,
      userValueDescription: `Your domicile is ${location.state}`,
      status: 'failed',
      importance: 'mandatory',
      failureExplanation: `Requires permanent residency/domicile in ${criteria.eligibleStates.join(', ')}.`,
    });
  }

  // 6. Minimum Academic Performance (Marks / Percentage)
  if (criteria.minPercentage !== undefined) {
    const relevantScore =
      academic.class12Percentage ??
      academic.currentPercentageOrCgpa ??
      academic.class10Percentage;

    if (relevantScore === undefined) {
      missing.push({
        id: 'marks',
        name: 'Academic Cutoff Marks',
        criterionDescription: `Requires minimum ${criteria.minPercentage}% marks in qualifying exam`,
        userValueDescription: 'Score not provided in profile',
        status: 'missing_info',
        importance: 'mandatory',
        failureExplanation: `Please update your Class 12 or current marks to evaluate eligibility against the ${criteria.minPercentage}% cutoff.`,
      });
    } else if (relevantScore >= criteria.minPercentage) {
      satisfied.push({
        id: 'marks',
        name: 'Academic Cutoff Marks',
        criterionDescription: `Requires minimum ${criteria.minPercentage}% marks in qualifying exam`,
        userValueDescription: `Your score: ${relevantScore}% (surpasses cutoff)`,
        status: 'satisfied',
        importance: 'mandatory',
      });
    } else {
      failed.push({
        id: 'marks',
        name: 'Academic Cutoff Marks',
        criterionDescription: `Requires minimum ${criteria.minPercentage}% marks in qualifying exam`,
        userValueDescription: `Your recorded score is ${relevantScore}% (short by ${(criteria.minPercentage - relevantScore).toFixed(1)}%)`,
        status: 'failed',
        importance: 'mandatory',
        failureExplanation: `Academic cutoff is ${criteria.minPercentage}%. Your recorded score is ${relevantScore}%.`,
      });
    }
  }

  // 7. Course & Stream Compatibility
  if (criteria.eligibleCourses && !criteria.eligibleCourses.includes('ALL')) {
    const userCourseLower = (academic.course || '').toLowerCase();
    const courseMatched = criteria.eligibleCourses.some(c =>
      userCourseLower.includes(c.toLowerCase()) ||
      (c.toLowerCase().includes('b.tech') && (userCourseLower.includes('b.e') || userCourseLower.includes('engineering') || userCourseLower.includes('tech'))) ||
      (c.toLowerCase().includes('mbbs') && (userCourseLower.includes('medical') || userCourseLower.includes('neet') || userCourseLower.includes('bds'))) ||
      (c.toLowerCase().includes('b.sc') && userCourseLower.includes('science'))
    );

    if (courseMatched) {
      satisfied.push({
        id: 'course',
        name: 'Eligible Courses / Streams',
        criterionDescription: `Open to: ${criteria.eligibleCourses.join(', ')}`,
        userValueDescription: `Your enrolled course: ${academic.course}`,
        status: 'satisfied',
        importance: 'mandatory',
      });
    } else {
      failed.push({
        id: 'course',
        name: 'Eligible Courses / Streams',
        criterionDescription: `Specifically for: ${criteria.eligibleCourses.join(', ')}`,
        userValueDescription: `Your enrolled course is ${academic.course}`,
        status: 'failed',
        importance: 'mandatory',
        failureExplanation: `This scheme is earmarked for students enrolled in ${criteria.eligibleCourses.join(', ')}.`,
      });
    }
  }

  // 8. Disability (PwD) Rule
  if (criteria.pwdOnly) {
    const userPct = financialAndCategory.pwdPercentage ?? 0;
    const minPct = criteria.minDisabilityPercentage ?? 40;
    if (financialAndCategory.isPwd && userPct >= minPct) {
      satisfied.push({
        id: 'pwd',
        name: 'Disability Benchmark',
        criterionDescription: `Requires verified PwD certification (minimum ${minPct}% disability)`,
        userValueDescription: `Declared: PwD with ${userPct}% disability`,
        status: 'satisfied',
        importance: 'mandatory',
      });
    } else {
      failed.push({
        id: 'pwd',
        name: 'Disability Benchmark',
        criterionDescription: `Exclusively for students with ≥ ${minPct}% disability`,
        userValueDescription: financialAndCategory.isPwd
          ? `Disability declared as ${userPct}% (below ${minPct}% threshold)`
          : 'Not registered as PwD in profile',
        status: 'failed',
        importance: 'mandatory',
        failureExplanation: `Designated exclusively for Specially-Abled (Divyangjan) scholars with at least ${minPct}% disability.`,
      });
    }
  }

  // 9. Single Girl Child Requirement
  if (criteria.singleGirlChildOnly) {
    if (financialAndCategory.isSingleGirlChild) {
      satisfied.push({
        id: 'sgc',
        name: 'Single Girl Child Affirmation',
        criterionDescription: 'Applicant must be the only daughter/child in the family',
        userValueDescription: 'Verified as Single Girl Child in profile',
        status: 'satisfied',
        importance: 'mandatory',
      });
    } else {
      failed.push({
        id: 'sgc',
        name: 'Single Girl Child Affirmation',
        criterionDescription: 'Exclusively for families with an only girl child',
        userValueDescription: 'Not indicated as Single Girl Child in profile',
        status: 'failed',
        importance: 'mandatory',
        failureExplanation: 'Restricted to single girl child candidates.',
      });
    }
  }

  // 10. Religious Minority Rule
  if (criteria.eligibleReligions && !criteria.eligibleReligions.includes('ALL')) {
    if (criteria.eligibleReligions.includes(financialAndCategory.religion as any)) {
      satisfied.push({
        id: 'religion',
        name: 'Minority Community',
        criterionDescription: `Open to recognized minorities: ${criteria.eligibleReligions.join(', ')}`,
        userValueDescription: `Your community: ${financialAndCategory.religion}`,
        status: 'satisfied',
        importance: 'mandatory',
      });
    } else {
      failed.push({
        id: 'religion',
        name: 'Minority Community',
        criterionDescription: `Restricted to notified religious minority communities: ${criteria.eligibleReligions.join(', ')}`,
        userValueDescription: `Your declared community is ${financialAndCategory.religion}`,
        status: 'failed',
        importance: 'mandatory',
        failureExplanation: 'This scholarship is notified exclusively for religious minority community students.',
      });
    }
  }

  // 11. Institute Type Rule
  if (criteria.instituteTypes && !criteria.instituteTypes.includes('ALL')) {
    if (criteria.instituteTypes.includes(academic.institutionType as any)) {
      satisfied.push({
        id: 'instituteType',
        name: 'Institution Type',
        criterionDescription: `Eligible colleges: ${criteria.instituteTypes.join(', ')}`,
        userValueDescription: `Your college type: ${academic.institutionType}`,
        status: 'satisfied',
        importance: 'preferred',
      });
    } else {
      failed.push({
        id: 'instituteType',
        name: 'Institution Type',
        criterionDescription: `Restricted to students in: ${criteria.instituteTypes.join(', ')}`,
        userValueDescription: `Your college type is ${academic.institutionType}`,
        status: 'failed',
        importance: 'preferred',
        failureExplanation: `Scheme requires enrollment in ${criteria.instituteTypes.join(', ')} institutions.`,
      });
    }
  }

  // Determine Overall Status & Weighted Score
  const totalEvaluated = satisfied.length + failed.length + missing.length;
  const scorePercent = totalEvaluated > 0 ? Math.round((satisfied.length / totalEvaluated) * 100) : 0;

  let overallStatus: OverallEligibility;
  let summaryMessage = '';
  const recommendations: string[] = [];

  if (failed.length === 0 && missing.length === 0) {
    overallStatus = 'eligible';
    summaryMessage = 'You meet 100% of the eligibility criteria for this scholarship.';
    recommendations.push('Prepare your mandatory documents and apply before the deadline.');
  } else if (failed.length === 0 && missing.length > 0) {
    overallStatus = 'conditionally_eligible';
    summaryMessage = `Matches all evaluated criteria, but ${missing.length} piece(s) of profile info are needed to verify full qualification.`;
    recommendations.push('Update the missing fields in your profile to confirm 100% eligibility.');
  } else if (failed.length === 1 && failed[0].importance === 'preferred') {
    overallStatus = 'conditionally_eligible';
    summaryMessage = 'Meets core eligibility; review preferred institution criteria.';
    recommendations.push('Check the official portal to see if exceptions or affiliated institution rules apply.');
  } else {
    overallStatus = 'ineligible';
    summaryMessage = `You do not satisfy ${failed.length} requirement(s) for this scheme.`;
    if (failed.some(f => f.id === 'income')) {
      recommendations.push('Explore scholarships with higher income ceilings or merit-based schemes without income limits.');
    }
    if (failed.some(f => f.id === 'marks')) {
      recommendations.push('Consider means-based foundation grants with lower cutoff marks (60%+).');
    }
    if (failed.some(f => f.id === 'domicile')) {
      recommendations.push(`Filter for Pan-India (All India) scholarships or schemes specific to ${location.state}.`);
    }
  }

  return {
    scholarshipId: scholarship.id,
    status: overallStatus,
    matchScore: scorePercent,
    satisfiedRules: satisfied,
    failedRules: failed,
    missingInfoRules: missing,
    summaryMessage,
    recommendations,
  };
}
