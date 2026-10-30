import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { ChatMessage, GroundedCitation } from '../types/advisor';
import { UserProfile } from '../types/user';
import { getHeuristicAdvisorResponse } from './heuristicAdvisor';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(
  GEMINI_API_KEY &&
  GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'
);

export async function askAdvisor(
  userQuery: string,
  history: ChatMessage[],
  profile: UserProfile | null
): Promise<ChatMessage> {
  // If not configured, immediately use offline heuristic advisor
  if (!isGeminiConfigured) {
    return getHeuristicAdvisorResponse(userQuery, profile);
  }

  try {
    // Grounding payload: summarize top scholarships relevant to student or query
    const compactCatalog = SCHOLARSHIPS_DATA.map(s => ({
      id: s.id,
      name: s.name,
      award: s.awardAmount.formatted,
      maxIncome: s.criteria.maxAnnualIncome,
      levels: s.criteria.eligibleLevels,
      courses: s.criteria.eligibleCourses,
      states: s.criteria.eligibleStates,
      categories: s.criteria.eligibleCategories,
      genders: s.criteria.eligibleGenders,
      url: s.source.officialUrl,
    }));

    const systemPrompt = `You are the AI Scholarship Advisor for "Scholarship Finder", helping Indian higher education students find authentic scholarships.
CRITICAL GROUNDING RULES:
1. ONLY recommend and discuss scholarships from the provided verified Indian catalog below, or verified official Indian government scholarship portals (NSP, State SSP, AICTE, DST).
2. DO NOT hallucinate nonexistent scholarships, fake deadlines, or inaccurate eligibility criteria.
3. If the student asks about a condition they do not meet, explain clearly and suggest realistic alternatives from the catalog.
4. Format your response cleanly with markdown bullet points. Keep it encouraging, practical, and direct.
5. If you mention a scholarship, mention its exact name so the system can link it.

STUDENT PROFILE CONTEXT:
${profile ? JSON.stringify({
  course: profile.academic.course,
  level: profile.academic.level,
  state: profile.location.state,
  annualIncome: profile.financialAndCategory.annualFamilyIncome,
  category: profile.financialAndCategory.category,
  gender: profile.financialAndCategory.gender,
  marks12th: profile.academic.class12Percentage,
}) : 'Guest student (no profile filled yet)'}

VERIFIED SCHOLARSHIP CATALOG:
${JSON.stringify(compactCatalog)}
`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nStudent Query: ${userQuery}` }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API call failed with status:', response.status);
      return getHeuristicAdvisorResponse(userQuery, profile);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return getHeuristicAdvisorResponse(userQuery, profile);
    }

    // Extract citations by matching catalog scholarship names
    const citations: GroundedCitation[] = [];
    for (const s of SCHOLARSHIPS_DATA) {
      if (text.toLowerCase().includes(s.name.toLowerCase()) || text.includes(s.id)) {
        citations.push({
          scholarshipId: s.id,
          name: s.name,
          award: s.awardAmount.formatted,
          officialUrl: s.source.officialUrl,
          relevanceReason: 'Referenced in advisor recommendation',
        });
      }
    }

    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      citations: citations.slice(0, 3),
      suggestedFollowUps: [
        'How to apply for these on the official portal?',
        'What documents are needed for verification?',
        'Check my detailed eligibility audit',
      ],
      isOfflineFallback: false,
    };
  } catch (error) {
    console.warn('Gemini API error, falling back to local advisor:', error);
    return getHeuristicAdvisorResponse(userQuery, profile);
  }
}
