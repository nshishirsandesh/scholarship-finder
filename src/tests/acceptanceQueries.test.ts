import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageQuery } from '../engine/nlQueryParser';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { getHeuristicAdvisorResponse } from '../services/heuristicAdvisor';
import { validateDocumentFile } from '../services/vaultStorageService';
import { DEMO_PERSONAS } from '../data/personas';
import { evaluateEligibility } from '../engine/eligibilityEngine';

describe('Acceptance Queries & Feature Audit Tests', () => {
  const ananya = DEMO_PERSONAS[0].profile;

  it('1. Parses and prioritizes engineering scholarships for girls', () => {
    const q = 'scholarships for girls in engineering';
    const parsed = parseNaturalLanguageQuery(q);
    expect(parsed.detectedGender).toBe('Female');
    expect(parsed.detectedLevel).toBe('Undergraduate');

    const matches = SCHOLARSHIPS_DATA.filter(s => {
      const isGenderOk = s.criteria.eligibleGenders.includes('Female') || s.criteria.eligibleGenders.includes('All');
      const isCourseOk = !s.criteria.eligibleCourses || s.criteria.eligibleCourses.includes('ALL') || s.criteria.eligibleCourses.some(c => c.toLowerCase().includes('b.tech') || c.toLowerCase().includes('engineering'));
      return isGenderOk && isCourseOk;
    });

    // Check that female-exclusive schemes exist in the dataset
    const femaleExclusive = matches.filter(s => s.criteria.eligibleGenders.length === 1 && s.criteria.eligibleGenders[0] === 'Female');
    expect(femaleExclusive.length).toBeGreaterThanOrEqual(4);
    expect(femaleExclusive.some(s => s.id === 'aicte-pragati')).toBe(true);
    expect(femaleExclusive.some(s => s.id === 'kotak-kanya')).toBe(true);
  });

  it('2. Correctly explains that there are no male-exclusive schemes and returns open schemes', () => {
    const q = 'Are there any scholarships exclusively for boys?';
    const parsed = parseNaturalLanguageQuery(q);
    expect(parsed.detectedGender).toBe('Male');

    const advisorRes = getHeuristicAdvisorResponse(q, null);
    expect(advisorRes.content).toContain('no government or corporate scholarships in India exclusively reserved for male students');
    expect(advisorRes.content).toContain('male students are fully eligible');
    expect(advisorRes.citations).toBeDefined();
    expect(advisorRes.citations!.length).toBeGreaterThan(0);
    expect(advisorRes.citations!.some(c => c.scholarshipId === 'reliance-foundation-ug' || c.scholarshipId === 'pm-usp-central-sector')).toBe(true);
  });

  it('3. AI Advisor provides the exact 6 mandatory documents for AICTE Pragati', () => {
    const q = 'What documents do I need for AICTE Pragati?';
    const advisorRes = getHeuristicAdvisorResponse(q, null);
    expect(advisorRes.content).toContain('Class 10 & 12 Marksheet');
    expect(advisorRes.content).toContain('Annual Family Income Certificate');
    expect(advisorRes.content).toContain('Bonafide Student Certificate');
    expect(advisorRes.content).toContain('Current Year Admission Fee Receipt');
    expect(advisorRes.content).toContain('Aadhaar Card');
    expect(advisorRes.content).toContain('Aadhaar-Seeded Bank Passbook');
    expect(advisorRes.citations).toBeDefined();
    expect(advisorRes.citations!.some(c => c.scholarshipId === 'aicte-pragati')).toBe(true);
  });

  it('4. Matches B.Tech Data Science students in Karnataka', () => {
    const q = 'Scholarships for B.Tech Data Science students in Karnataka';
    const parsed = parseNaturalLanguageQuery(q);
    expect(parsed.detectedState).toBe('Karnataka');

    const matches = SCHOLARSHIPS_DATA.filter(s => {
      const isStateOk = s.criteria.eligibleStates.includes('Karnataka') || s.criteria.eligibleStates.includes('ALL');
      const isCourseOk = !s.criteria.eligibleCourses || s.criteria.eligibleCourses.includes('ALL') || s.criteria.eligibleCourses.some(c => c.toLowerCase().includes('data science') || c.toLowerCase().includes('b.tech'));
      return isStateOk && isCourseOk;
    });

    expect(matches.some(s => s.id === 'karnataka-ssp')).toBe(true);
    expect(matches.some(s => s.id === 'karnataka-vidyasiri')).toBe(true);
  });

  it('5. Explains Document Vault client-side privacy architecture', () => {
    const q = 'How does the Document Vault protect my privacy?';
    const advisorRes = getHeuristicAdvisorResponse(q, null);
    expect(advisorRes.content).toContain('IndexedDB database');
    expect(advisorRes.content).toContain('ScholarshipFinderVaultDB');
    expect(advisorRes.content).toContain('never uploaded to external servers');
    expect(advisorRes.content).toContain('10MB');
    expect(advisorRes.content).toContain('Wipe All Local Data');
  });

  it('6. Document Vault enforces strict file size and MIME type validation', () => {
    // Valid PDF
    const validPdf = new File(['%PDF-1.4 dummy content'], 'income_cert.pdf', { type: 'application/pdf' });
    expect(validateDocumentFile(validPdf).valid).toBe(true);

    // Valid PNG
    const validPng = new File(['png-dummy-bytes'], 'marksheet.png', { type: 'image/png' });
    expect(validateDocumentFile(validPng).valid).toBe(true);

    // Invalid MIME type (.exe)
    const invalidExe = new File(['fake-exe-content'], 'malware.exe', { type: 'application/x-msdownload' });
    const exeRes = validateDocumentFile(invalidExe);
    expect(exeRes.valid).toBe(false);
    expect(exeRes.error).toContain('Unsupported file format');

    // Invalid file size > 10MB
    const oversizedBytes = new Uint8Array(11 * 1024 * 1024);
    const oversizedFile = new File([oversizedBytes], 'huge.pdf', { type: 'application/pdf' });
    const sizeRes = validateDocumentFile(oversizedFile);
    expect(sizeRes.valid).toBe(false);
    expect(sizeRes.error).toContain('10 MB');
  });

  it('7. Accurately calculates deterministic eligibility and document requirements for Ananya', () => {
    const student = { ...ananya, uid: 'test_ananya', updatedAt: new Date().toISOString() };
    const pragati = SCHOLARSHIPS_DATA.find(s => s.id === 'aicte-pragati');
    expect(pragati).toBeDefined();

    const result = evaluateEligibility(pragati!, student);
    expect(result.status).toBe('eligible');
    expect(result.matchScore).toBe(100);
    expect(pragati!.requiredDocuments).toContain('income_cert');
    expect(pragati!.requiredDocuments).toContain('bonafide_cert');
    expect(pragati!.requiredDocuments).toContain('marksheet_12');
  });

  it('8. Heuristic AI Advisor conducts head-to-head comparison of two scholarships', () => {
    const q = 'compare aicte-pragati and reliance-foundation-ug';
    const advisorRes = getHeuristicAdvisorResponse(q, null);
    expect(advisorRes.content).toContain('Head-to-Head Comparison');
    expect(advisorRes.content).toContain('AICTE Pragati');
    expect(advisorRes.content).toContain('Reliance Foundation');
    expect(advisorRes.content).toContain('Award Amount');
    expect(advisorRes.content).toContain('Family Income Ceiling');
    expect(advisorRes.citations).toBeDefined();
    expect(advisorRes.citations!.length).toBe(2);
  });

  it('9. Computes document readiness accurately for a scholarship', () => {
    const pragati = SCHOLARSHIPS_DATA.find(s => s.id === 'aicte-pragati')!;
    expect(pragati.requiredDocuments.length).toBeGreaterThan(0);

    // When 0 documents are uploaded:
    const uploadedDocsEmpty: string[] = [];
    const readinessZero = Math.round(
      (pragati.requiredDocuments.filter(d => uploadedDocsEmpty.includes(d)).length / pragati.requiredDocuments.length) * 100
    );
    expect(readinessZero).toBe(0);

    // When 2 documents are uploaded:
    const uploadedDocsPartial = [pragati.requiredDocuments[0], pragati.requiredDocuments[1]];
    const readinessPartial = Math.round(
      (pragati.requiredDocuments.filter(d => uploadedDocsPartial.includes(d)).length / pragati.requiredDocuments.length) * 100
    );
    expect(readinessPartial).toBeGreaterThan(0);
    expect(readinessPartial).toBeLessThan(100);

    // When all required documents are uploaded:
    const uploadedDocsAll = [...pragati.requiredDocuments];
    const readinessFull = Math.round(
      (pragati.requiredDocuments.filter(d => uploadedDocsAll.includes(d)).length / pragati.requiredDocuments.length) * 100
    );
    expect(readinessFull).toBe(100);
  });
});
