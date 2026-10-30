import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageQuery } from '../engine/nlQueryParser';

describe('Natural Language Query Parser', () => {
  it('extracts gender, level, income, and state from colloquial query', () => {
    const query = 'scholarships for girls in engineering under 2 lakhs in karnataka';
    const parsed = parseNaturalLanguageQuery(query);

    expect(parsed.detectedGender).toBe('Female');
    expect(parsed.detectedLevel).toBe('Undergraduate');
    expect(parsed.detectedMaxIncome).toBe(200000);
    expect(parsed.detectedState).toBe('Karnataka');
    expect(parsed.explanation.length).toBeGreaterThan(0);
  });

  it('detects category and academic marks cutoff percentages', () => {
    const query = 'minority scholarships above 85%';
    const parsed = parseNaturalLanguageQuery(query);

    expect(parsed.detectedCategory).toBe('Minority');
    expect(parsed.detectedMinMarks).toBe(85);
  });

  it('detects SC category and state from short phrase', () => {
    const query = 'sc post matric in maharashtra';
    const parsed = parseNaturalLanguageQuery(query);

    expect(parsed.detectedCategory).toBe('SC');
    expect(parsed.detectedState).toBe('Maharashtra');
  });
});
