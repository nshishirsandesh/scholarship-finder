import { describe, it, expect } from 'vitest';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { DEMO_PERSONAS } from '../data/personas';
import { evaluateEligibility } from '../engine/eligibilityEngine';
import { parseNaturalLanguageQuery } from '../engine/nlQueryParser';
import { calculateFundingPlan } from '../engine/fundingPlanner';
import { ApplicationTrackerItem } from '../types/tracker';
import { UserProfile } from '../types/user';

describe('End-to-End User Journey Integration', () => {
  it('simulates complete student lifecycle: login -> search -> audit -> track -> plan', () => {
    // 1. Student Persona initialized
    const student: UserProfile = {
      ...DEMO_PERSONAS[0].profile,
      uid: 'journey_ananya',
      updatedAt: new Date().toISOString(),
    };
    expect(student.isOnboardingCompleted).toBe(true);

    // 2. Student searches using colloquial phrase
    const nlQuery = 'scholarships for girls in engineering';
    const parsed = parseNaturalLanguageQuery(nlQuery);
    expect(parsed.detectedGender).toBe('Female');
    expect(parsed.detectedLevel).toBe('Undergraduate');

    // 3. System identifies matching verified scholarships
    const matched = SCHOLARSHIPS_DATA.filter(s => {
      const isGenderOk = s.criteria.eligibleGenders.includes('All') || s.criteria.eligibleGenders.includes('Female');
      const isCourseOk = !s.criteria.eligibleCourses || s.criteria.eligibleCourses.includes('ALL') || s.criteria.eligibleCourses.includes('B.Tech / B.E');
      return isGenderOk && isCourseOk;
    });
    expect(matched.length).toBeGreaterThan(0);

    // 4. Deterministic eligibility audit evaluated for AICTE Pragati
    const pragati = matched.find(s => s.id === 'aicte-pragati');
    expect(pragati).toBeDefined();

    const audit = evaluateEligibility(pragati!, student);
    expect(audit.status).toBe('eligible');
    expect(audit.matchScore).toBe(100);
    expect(audit.satisfiedRules.length).toBeGreaterThan(3);

    // 5. Student adds to Application Tracker
    const tracker: ApplicationTrackerItem[] = [
      {
        scholarshipId: pragati!.id,
        stage: 'saved',
        savedAt: new Date().toISOString(),
      },
    ];
    expect(tracker[0].stage).toBe('saved');

    // 6. Student advances stage to 'preparing_documents' and sets notes
    tracker[0].stage = 'preparing_documents';
    tracker[0].notes = 'Applied for Income Certificate at MeeSeva center';
    expect(tracker[0].stage).toBe('preparing_documents');
    expect(tracker[0].notes).toContain('MeeSeva');

    // 7. Student runs Funding Planner
    const fundingPlan = calculateFundingPlan(student, SCHOLARSHIPS_DATA);
    expect(fundingPlan.totalAnnualExpense).toBeGreaterThan(0);
    expect(fundingPlan.realisticExpectedAid).toBeGreaterThan(0);
    expect(fundingPlan.coveragePercentage).toBeGreaterThan(0);
  });
});
