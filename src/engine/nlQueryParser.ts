import { INDIAN_STATES } from '../data/indianStates';
import { Category, EducationLevel, Gender, ApplicationStatus } from '../types/scholarship';

export interface ParsedNLQuery {
  rawQuery: string;
  detectedGender?: Gender;
  detectedCategory?: Category | 'Minority';
  detectedLevel?: EducationLevel;
  detectedState?: string;
  detectedMaxIncome?: number;
  detectedMinMarks?: number;
  detectedStatus?: ApplicationStatus;
  detectedCourse?: string;
  detectedTuitionNeed?: boolean;
  detectedKeywords: string[];
  explanation: string[];
}

export function parseNaturalLanguageQuery(query: string): ParsedNLQuery {
  const lower = query.toLowerCase().trim();
  const explanations: string[] = [];
  const parsed: ParsedNLQuery = {
    rawQuery: query,
    detectedKeywords: [],
    explanation: explanations,
  };

  if (!lower) return parsed;

  // 1. Gender Detection
  if (/\b(girls?|female|women|woman|kanya|beti)\b/.test(lower)) {
    parsed.detectedGender = 'Female';
    explanations.push('Gender: Female');
  } else if (/\b(boys?|male|men)\b/.test(lower)) {
    parsed.detectedGender = 'Male';
    explanations.push('Gender: Male / Open to all');
  }

  // 2. Category Detection
  if (/\b(sc|scheduled caste)\b/.test(lower)) {
    parsed.detectedCategory = 'SC';
    explanations.push('Category: Scheduled Caste (SC)');
  } else if (/\b(st|scheduled tribe)\b/.test(lower)) {
    parsed.detectedCategory = 'ST';
    explanations.push('Category: Scheduled Tribe (ST)');
  } else if (/\b(obc|obc-ncl|backward class|bc)\b/.test(lower)) {
    parsed.detectedCategory = 'OBC-NCL';
    explanations.push('Category: OBC-NCL');
  } else if (/\b(ews|economically weaker)\b/.test(lower)) {
    parsed.detectedCategory = 'EWS';
    explanations.push('Category: EWS');
  } else if (/\b(minority|muslim|christian|sikh|jain|buddhist|parsi)\b/.test(lower)) {
    parsed.detectedCategory = 'Minority';
    explanations.push('Category: Religious Minority');
  }

  // 3. Education Level Detection
  if (/\b(b\.?tech|engineering|b\.?e|mbbs|b\.?sc|b\.?com|b\.?a|undergraduate|degree|ug|college)\b/.test(lower)) {
    parsed.detectedLevel = 'Undergraduate';
    explanations.push('Level: Undergraduate');
  } else if (/\b(m\.?tech|pg|postgraduate|masters?|phd|doctorate)\b/.test(lower)) {
    parsed.detectedLevel = 'Postgraduate';
    explanations.push('Level: Postgraduate');
  } else if (/\b(diploma|polytechnic)\b/.test(lower)) {
    parsed.detectedLevel = 'Diploma';
    explanations.push('Level: Diploma');
  } else if (/\b(12th|class 12|hsc|puc|inter|intermediate)\b/.test(lower)) {
    parsed.detectedLevel = 'Class 12';
    explanations.push('Level: Class 12');
  } else if (/\b(10th|class 10|sslc|matric)\b/.test(lower)) {
    parsed.detectedLevel = 'Class 10';
    explanations.push('Level: Class 10');
  }

  // 4. Specific Course / Stream Detection
  if (/\b(computer science|cse|cs)\b/.test(lower)) {
    parsed.detectedCourse = 'Computer Science';
    explanations.push('Course: Computer Science');
  } else if (/\b(data science|ai|artificial intelligence)\b/.test(lower)) {
    parsed.detectedCourse = 'Data Science';
    explanations.push('Course: Data Science');
  } else if (/\b(engineering|b\.?tech|b\.?e)\b/.test(lower)) {
    parsed.detectedCourse = 'Engineering';
    explanations.push('Course: Engineering');
  } else if (/\b(mbbs|medical|doctor)\b/.test(lower)) {
    parsed.detectedCourse = 'Medicine';
    explanations.push('Course: Medicine / MBBS');
  }

  // 5. State / Domicile Detection
  for (const s of INDIAN_STATES) {
    const sLower = s.name.toLowerCase();
    if (lower.includes(sLower) || (s.code && new RegExp(`\\b${s.code.toLowerCase()}\\b`).test(lower))) {
      parsed.detectedState = s.name;
      explanations.push(`Domicile: ${s.name}`);
      break;
    }
  }

  // 6. Income Ceiling Detection (e.g. "below 2.5 lakh", "under 2.5l", "income 300000")
  const lakhMatch = lower.match(/(?:under|below|less than|within|income)\s*(?:of\s*)?(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l\b)/);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1]);
    parsed.detectedMaxIncome = Math.round(num * 100000);
    explanations.push(`Max Income: ≤ ₹${parsed.detectedMaxIncome.toLocaleString('en-IN')}`);
  } else {
    const directIncomeMatch = lower.match(/(?:under|below|less than)\s*(?:rs\.?|inr|₹)?\s*(\d{5,7})\b/);
    if (directIncomeMatch) {
      parsed.detectedMaxIncome = parseInt(directIncomeMatch[1], 10);
      explanations.push(`Max Income: ≤ ₹${parsed.detectedMaxIncome.toLocaleString('en-IN')}`);
    }
  }

  // 7. Academic Marks Detection (e.g. "with 85% marks", "above 80 percent", "min 75%")
  const marksMatch = lower.match(/(?:above|min|minimum|greater than|>|with|having|scored)?\s*(\d{2}(?:\.\d+)?)\s*(?:%|percent(?:\s*marks)?)/);
  if (marksMatch) {
    parsed.detectedMinMarks = parseFloat(marksMatch[1]);
    explanations.push(`Academic Cutoff: ≥ ${parsed.detectedMinMarks}%`);
  }

  // 8. Application Status Detection (e.g. "currently open", "applications are open")
  if (/\b(open|currently open|active applications|accepting applications)\b/.test(lower)) {
    parsed.detectedStatus = 'Open';
    explanations.push('Status: Currently Open');
  }

  // 9. Tuition / Financial Need Assistance
  if (/\b(tuition|fee assistance|fee waiver|hostel allowance|living assistance|need financial aid)\b/.test(lower)) {
    parsed.detectedTuitionNeed = true;
    explanations.push('Benefit: Tuition / Fee Waiver Support');
  }

  // Extract residual meaningful keywords
  const stopWords = new Set([
    'scholarships', 'scholarship', 'finder', 'find', 'for', 'in', 'and', 'the', 'a',
    'an', 'to', 'of', 'with', 'under', 'below', 'me', 'give', 'show', 'all', 'available',
    'students', 'student', 'schemes', 'scheme', 'pursuing', 'studying', 'whose', 'are'
  ]);

  const tokens = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  parsed.detectedKeywords = Array.from(new Set(tokens));

  return parsed;
}
