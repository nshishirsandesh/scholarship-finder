import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { evaluateEligibility } from '../engine/eligibilityEngine';
import { ChatMessage, GroundedCitation } from '../types/advisor';
import { UserProfile } from '../types/user';
import { INDIAN_DOCUMENTS_TAXONOMY } from '../data/documentsTaxonomy';
import { VaultDocument } from '../types/documentVault';
import { getStoredVaultDocumentMetas } from '../services/vaultStorageService';

export function getHeuristicAdvisorResponse(
  userQuery: string,
  profile: UserProfile | null
): ChatMessage {
  const queryLower = userQuery.toLowerCase();
  const citations: GroundedCitation[] = [];
  const followUps: string[] = [];
  let responseText = '';

  // 0. Comparison Inquiries (e.g. "Compare AICTE Pragati and Kotak Kanya", "Reliance vs Siemens")
  if (/(compare|difference between|versus|\bvs\b)/i.test(queryLower)) {
    const compareParts = queryLower
      .replace(/^.*?\b(compare|difference between)\b/i, '')
      .split(/\s+\b(and|vs|versus|with)\b\s+/i)
      .map(p => p.trim())
      .filter(p => p.length > 2 && !['and', 'vs', 'versus', 'with'].includes(p));

    let matchedSchemes: typeof SCHOLARSHIPS_DATA = [];

    if (compareParts.length >= 2) {
      const part1 = compareParts[0];
      const part2 = compareParts[1];

      const match1 = SCHOLARSHIPS_DATA.find(s => s.id === part1 || s.id.includes(part1) || s.name.toLowerCase().includes(part1));
      const match2 = SCHOLARSHIPS_DATA.find(s => s.id !== match1?.id && (s.id === part2 || s.id.includes(part2) || s.name.toLowerCase().includes(part2)));

      if (match1 && match2) {
        matchedSchemes = [match1, match2];
      }
    }

    if (matchedSchemes.length < 2) {
      matchedSchemes = SCHOLARSHIPS_DATA.filter(s => {
        const nameTokens = s.name.toLowerCase().split(/[\s-]+/).filter(w => w.length > 3 && !['scholarship', 'scheme', 'foundation', 'national', 'central'].includes(w));
        return nameTokens.some(t => queryLower.includes(t)) || queryLower.includes(s.id);
      }).slice(0, 2);
    }

    if (matchedSchemes.length >= 2) {
      const [s1, s2] = matchedSchemes;
      responseText =
        `### Head-to-Head Comparison: **${s1.name}** vs **${s2.name}**\n\n` +
        `| Feature | ${s1.name} | ${s2.name} |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Award Amount** | ${s1.awardAmount.formatted} | ${s2.awardAmount.formatted} |\n` +
        `| **Provider Type** | ${s1.providerType} | ${s2.providerType} |\n` +
        `| **Family Income Ceiling** | ${s1.criteria.maxAnnualIncome ? `≤ ₹${s1.criteria.maxAnnualIncome.toLocaleString('en-IN')}` : 'No strict ceiling'} | ${s2.criteria.maxAnnualIncome ? `≤ ₹${s2.criteria.maxAnnualIncome.toLocaleString('en-IN')}` : 'No strict ceiling'} |\n` +
        `| **Academic Cutoff** | ${s1.criteria.minPercentage ? `≥ ${s1.criteria.minPercentage}% marks` : 'Admission merit'} | ${s2.criteria.minPercentage ? `≥ ${s2.criteria.minPercentage}% marks` : 'Admission merit'} |\n` +
        `| **Gender Eligibility** | ${s1.criteria.eligibleGenders.join(', ')} | ${s2.criteria.eligibleGenders.join(', ')} |\n` +
        `| **Current Status** | ${s1.deadline.status} (${s1.deadline.closingDate || 'See portal'}) | ${s2.deadline.status} (${s2.deadline.closingDate || 'See portal'}) |\n\n` +
        `**Key Strategic Difference:**\n` +
        `• **${s1.name}**: ${s1.shortDescription}\n` +
        `• **${s2.name}**: ${s2.shortDescription}\n\n` +
        `*Tip: You can add both to your Comparison Bar on Discover to compare up to 4 schemes simultaneously.*`;

      matchedSchemes.forEach(s => {
        citations.push({
          scholarshipId: s.id,
          name: s.name,
          award: s.awardAmount.formatted,
          officialUrl: s.source.officialUrl,
          relevanceReason: `Official source and criteria for ${s.name}`,
        });
      });

      followUps.push(
        `What documents do I need for ${s1.name}?`,
        `What documents do I need for ${s2.name}?`,
        'Can I apply for both scholarships simultaneously?'
      );
    } else {
      responseText =
        `**Scholarship Comparison Tool:**\n\n` +
        `To run a head-to-head comparison, please name two specific scholarships (for example: *"Compare AICTE Pragati and Kotak Kanya"* or *"Reliance vs Siemens"*).\n\n` +
        `You can also add up to 4 scholarships directly to the **Comparison Bar** from the Discover tab for a complete side-by-side criteria matrix.`;
    }
  }
  // 1. Inquiries about Scholarships Exclusively for Boys / Male Students
  else if (/\b(boys?|male|men)\b|exclusively for boys|only for boys/i.test(queryLower)) {
    responseText =
      `**Official Policy Context:**\n` +
      `Under Indian central and state welfare frameworks, affirmative action programs provide reservations and dedicated grants specifically for female students (such as AICTE Pragati, Kotak Kanya, Santoor, and Infosys STEM Stars) to promote women's enrolment in higher education.\n\n` +
      `There are **no government or corporate scholarships in India exclusively reserved for male students**.\n\n` +
      `However, **male students are fully eligible for all general merit, need-based, and course-based scholarships**, including:\n\n` +
      `1. **PM-USP Central Sector Scheme (NSP CSSS)**: ₹12,000–₹20,000/year for college students in the top 20th percentile of their Class 12 board with family income ≤ ₹4.5 Lakh.\n` +
      `2. **Reliance Foundation Undergraduate Scholarship**: Up to ₹2,00,000 grant for undergraduate students across all streams (income ≤ ₹15 Lakh, with preference for < ₹2.5 Lakh).\n` +
      `3. **Siemens Scholarship Program**: 100% tuition reimbursement + laptop + mentoring for 1st-year government college engineering students.\n` +
      `4. **Schindler Igniting Minds**: Up to ₹50,000/year for technical diploma and B.Tech engineering students.\n` +
      `5. **HDFC Badhte Kadam**: ₹30,000–₹1,00,000 need-based assistance for students facing financial distress.\n` +
      `6. **Post-Matric State Scholarships (SC/ST/OBC/EWS)**: Full fee waiver and maintenance in your respective state (e.g. Telangana ePASS, Karnataka SSP, MahaDBT).`;

    const openScholarships = SCHOLARSHIPS_DATA.filter(
      s => s.id === 'pm-usp-central-sector' || s.id === 'reliance-foundation-ug' || s.id === 'siemens-scholarship' || s.id === 'schindler-igniting-minds'
    );

    openScholarships.forEach(s => {
      citations.push({
        scholarshipId: s.id,
        name: s.name,
        award: s.awardAmount.formatted,
        officialUrl: s.source.officialUrl,
        relevanceReason: 'Open to all eligible students (male & female) meeting academic/income rules',
      });
    });

    followUps.push(
      'What scholarships match my active profile?',
      'How to apply for PM-USP Central Sector on NSP?',
      'Reliance Foundation eligibility criteria'
    );
  }
  // 2. Specific inquiry: Documents for AICTE Pragati
  else if (/(pragati.*(doc|certificate|require)|what.*pragati.*doc|document.*pragati)/i.test(queryLower)) {
    responseText =
      `To apply for the **AICTE Pragati Scholarship for Girls** (Technical Degree / Diploma), you must assemble the following **6 mandatory documents**:\n\n` +
      `1. **Class 10 & 12 Marksheet**: Certified copies showing qualifying entrance exam marks (or diploma marks for lateral entry).\n` +
      `2. **Annual Family Income Certificate**: Issued by an authorized executive magistrate or Tehsildar/SDM for the current financial year. Family income must strictly not exceed **₹8,00,000/year**.\n` +
      `3. **Bonafide Student Certificate**: Issued by the Director/Principal/Registrar of your AICTE-approved engineering college on institute letterhead (Annexure-II).\n` +
      `4. **Current Year Admission Fee Receipt**: Official receipt showing tuition payment for 1st-year admission.\n` +
      `5. **Aadhaar Card**: Student's valid Aadhaar identity proof.\n` +
      `6. **Aadhaar-Seeded Bank Passbook**: Bank account in the applicant's sole name, linked with Aadhaar via NPCI for Direct Benefit Transfer (DBT).\n\n` +
      `*Note: A maximum of two girl children per family are eligible under AICTE guidelines.*`;

    const pragati = SCHOLARSHIPS_DATA.find(s => s.id === 'aicte-pragati');
    if (pragati) {
      citations.push({
        scholarshipId: pragati.id,
        name: pragati.name,
        award: pragati.awardAmount.formatted,
        officialUrl: pragati.source.officialUrl,
        relevanceReason: 'Official AICTE Student Development Scheme guidelines',
      });
    }

    followUps.push(
      'Upload certificates to Document Vault',
      'How to seed bank account with NPCI for DBT?',
      'Check my eligibility for AICTE Pragati'
    );
  }
  // 3. Document Vault Privacy & Security
  else if (/(vault.*privacy|protect.*privacy|privacy.*vault|indexeddb|where.*store|secure.*data)/i.test(queryLower)) {
    responseText =
      `**How the Document Vault Protects Your Privacy:**\n\n` +
      `1. **Local Browser Isolation**: In this local prototype version, all uploaded certificate files (PDF, PNG, JPG) and metadata are stored directly in your browser's private **IndexedDB database** (\`ScholarshipFinderVaultDB\`).\n` +
      `2. **Zero Unauthorized Cloud Sync**: Documents are **never uploaded to external servers** or commercial cloud storage without your explicit action. They remain sandboxed to this origin.\n` +
      `3. **Size & MIME Validation**: Files are strictly restricted to legitimate document types (PDF, PNG, JPG) up to **10MB**, preventing arbitrary file execution.\n` +
      `4. **Readiness Calculation**: Match percentages and readiness scores are computed entirely client-side using deterministic comparison against official scheme rules.\n` +
      `5. **1-Click Export and Purge**: You have complete sovereignty over your data. In **Profile Settings**, you can download your complete structured JSON backup or click **Wipe All Local Data** to permanently delete all stored credentials and documents instantly.`;

    citations.push({
      scholarshipId: 'vault_privacy',
      name: 'Client-Side Data Privacy Protocol',
      award: 'IndexedDB Sandboxed Storage',
      officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
      relevanceReason: 'Official architectural design for zero-telemetry local storage',
    });

    followUps.push(
      'Go to Document Vault to upload certificates',
      'How do I wipe all my data?',
      'Export my profile data as JSON'
    );
  }
  // 4. Specific inquiry: Document Readiness for Reliance Foundation Undergraduate
  else if (/(reliance.*(readiness|document|vault)|readiness.*reliance)/i.test(queryLower)) {
    const reliance = SCHOLARSHIPS_DATA.find(s => s.id === 'reliance-foundation-ug');
    const storedDocs: VaultDocument[] = profile ? getStoredVaultDocumentMetas(profile.uid) : [];
    const required = reliance?.requiredDocuments || ['marksheet_12', 'income_cert', 'bonafide_cert', 'fee_receipt', 'bank_passbook', 'aadhaar_card'];

    const uploaded = required.filter(reqId => storedDocs.some((d: VaultDocument) => d.documentType === reqId));
    const missing = required.filter(reqId => !storedDocs.some((d: VaultDocument) => d.documentType === reqId));
    const pct = Math.round((uploaded.length / required.length) * 100);

    responseText =
      `**Document Readiness for Reliance Foundation Undergraduate Scholarship:**\n\n` +
      `• **Readiness Score**: **${pct}%** (${uploaded.length} of ${required.length} required certificates in Vault)\n\n` +
      (uploaded.length > 0
        ? `✅ **Uploaded & Ready in Vault:**\n` +
          uploaded.map(id => {
            const tax = INDIAN_DOCUMENTS_TAXONOMY.find(t => t.id === id);
            return `  • ${tax ? tax.name : id}`;
          }).join('\n') + `\n\n`
        : `⚠️ *No required certificates have been uploaded to your Document Vault yet.*\n\n`) +
      (missing.length > 0
        ? `📋 **Still Missing (Required before deadline):**\n` +
          missing.map(id => {
            const tax = INDIAN_DOCUMENTS_TAXONOMY.find(t => t.id === id);
            return `  • **${tax ? tax.name : id}** (${tax?.issuingAuthority || 'Authorized authority'})`;
          }).join('\n') + `\n\n`
        : `🎉 *All mandatory documents are ready for application!*\n\n`) +
      `You can upload the missing certificates directly in the **Document Vault** or by clicking "Why You Match" on the Reliance card.`;

    if (reliance) {
      citations.push({
        scholarshipId: reliance.id,
        name: reliance.name,
        award: reliance.awardAmount.formatted,
        officialUrl: reliance.source.officialUrl,
        relevanceReason: `Mandatory document requirements for ${reliance.awardAmount.formatted}`,
      });
    }

    followUps.push(
      'Upload missing certificates to Document Vault',
      'What is the selection process for Reliance Scholarship?',
      'Reliance aptitude test guidelines'
    );
  }
  // 5. Inquiries about B.Tech / Data Science in Karnataka
  else if (/(karnataka.*(b\.?tech|data science|engineering)|(b\.?tech|data science).*karnataka)/i.test(queryLower)) {
    const karnatakaSchemes = SCHOLARSHIPS_DATA.filter(
      s => (s.criteria.eligibleStates.includes('Karnataka') || s.criteria.eligibleStates.includes('ALL')) &&
           s.criteria.eligibleCourses?.some(c => c.toLowerCase().includes('b.tech') || c.toLowerCase().includes('data science') || c.toLowerCase().includes('engineering'))
    );

    responseText =
      `For **B.Tech Data Science & Engineering students in Karnataka**, here are the top verified state and corporate scholarships:\n\n` +
      `1. **Karnataka State Scholarship Portal (SSP) Post-Matric**: Official government fee reimbursement and maintenance for SC, ST, OBC, and EWS students studying in Karnataka.\n` +
      `2. **Karnataka Vidyasiri (Food & Accommodation)**: ₹1,500/month stipend for rural/low-income students not allotted government hostels.\n` +
      `3. **Karnataka Kittur Rani Chennamma Scholarship**: Dedicated financial support of ₹5,000/year for backward class female students in degree/engineering courses.\n` +
      `4. **Sitaram Jindal Foundation Scholarship**: Annual grant of up to ₹30,000 for undergraduate engineering students (administered from Jindal Nagar, Tumkur Road, Bengaluru).\n` +
      `5. **Federal Bank Hormis Memorial Foundation**: 100% tuition coverage for engineering students residing in Karnataka with family income ≤ ₹3.0 Lakh.\n\n` +
      `Ensure you have your **Karnataka SSP Student ID**, **e-Attestation of marks memos**, and **RD Number Income Certificate** from the Nadakacheri portal!`;

    const cited = SCHOLARSHIPS_DATA.filter(
      s => s.id === 'karnataka-ssp' || s.id === 'karnataka-vidyasiri' || s.id === 'sitaram-jindal-foundation' || s.id === 'karnataka-kittur-rani-chennamma'
    );

    cited.forEach(s => {
      citations.push({
        scholarshipId: s.id,
        name: s.name,
        award: s.awardAmount.formatted,
        officialUrl: s.source.officialUrl,
        relevanceReason: 'Applicable for B.Tech/Data Science engineering students in Karnataka',
      });
    });

    followUps.push(
      'What documents are needed for Karnataka SSP?',
      'How does Nadakacheri RD number verification work?',
      'Check Sitaram Jindal Foundation application process'
    );
  }
  // 6. Inquiries about Deadlines in Next 15 Days
  else if (/(deadline.*15|next 15 days|closing soon|upcoming deadline|closing date)/i.test(queryLower)) {
    const REFERENCE_DATE = new Date('2026-10-29T00:00:00Z');
    const FIFTEEN_DAYS = new Date('2026-11-13T23:59:59Z');

    const closingSoon = SCHOLARSHIPS_DATA.filter(s => {
      if (s.deadline.status !== 'Open' || !s.deadline.closingDate) return false;
      const close = new Date(s.deadline.closingDate);
      return close >= REFERENCE_DATE && close <= new Date('2026-11-20T23:59:59Z');
    }).sort((a, b) => new Date(a.deadline.closingDate!).getTime() - new Date(b.deadline.closingDate!).getTime());

    responseText =
      `Based on today's reference date (**October 29, 2026**), here are the verified scholarships with application deadlines approaching soonest:\n\n` +
      closingSoon.slice(0, 5).map(s => {
        const close = new Date(s.deadline.closingDate!);
        const diffDays = Math.ceil((close.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));
        return `• **${s.name}**\n` +
               `  - Closing Date: **${s.deadline.closingDate}** (${diffDays} days remaining)\n` +
               `  - Award: ${s.awardAmount.formatted}\n` +
               `  - Portal: ${s.source.portalName}`;
      }).join('\n\n') +
      `\n\n*Make sure to submit your online applications before the portal servers experience last-minute traffic congestion!*`;

    closingSoon.slice(0, 4).forEach(s => {
      citations.push({
        scholarshipId: s.id,
        name: s.name,
        award: s.awardAmount.formatted,
        officialUrl: s.source.officialUrl,
        relevanceReason: `Closing soon: ${s.deadline.closingDate}`,
      });
    });

    followUps.push(
      'Set calendar reminder for these deadlines',
      'What documents do I need to submit right away?',
      'Show my application tracker'
    );
  }
  // 7. General Inquiries about Girls / Women in STEM or Tech
  else if (/(girl|female|woman|women|pragati|kanya|stem|engineering.*girl)/i.test(queryLower)) {
    const girlScholarships = SCHOLARSHIPS_DATA.filter(
      s => s.id === 'aicte-pragati' || s.id === 'kotak-kanya' || s.id === 'infosys-stem-stars' || s.id === 'rolls-royce-unnati'
    );

    responseText =
      `Here are the premier verified scholarships dedicated to female students pursuing technical & higher education in India:\n\n` +
      `1. **AICTE Pragati Scholarship for Girls**: Grants ₹50,000/year to girl students admitted to AICTE-approved degree or diploma technical courses. Annual family income must be below ₹8,00,000.\n\n` +
      `2. **Kotak Kanya Scholarship**: High-value funding of ₹1,50,000/year for girls pursuing professional graduation (B.Tech, MBBS, Law) scoring 85%+ in Class 12.\n\n` +
      `3. **Infosys Foundation STEM Stars**: Up to ₹1,00,000/year covering tuition and living expenses for 1st-year girl students in NIRF-ranked institutions.\n\n` +
      `4. **Rolls-Royce Unnati Scholarship**: ₹35,000 one-time financial grant for female engineering undergraduates.\n\n` +
      `Make sure your 12th marksheet, admission fee receipt, and family income certificate from the Tehsildar are ready!`;

    girlScholarships.forEach(s => {
      citations.push({
        scholarshipId: s.id,
        name: s.name,
        award: s.awardAmount.formatted,
        officialUrl: s.source.officialUrl,
        relevanceReason: 'Exclusively earmarked for female students in higher education',
      });
    });

    followUps.push(
      'What documents do I need for AICTE Pragati?',
      'How to apply on the National Scholarship Portal?',
      'Check my eligibility for Kotak Kanya'
    );
  }
  // 8. Inquiries about Low Family Income (<2.5L or <1.5L)
  else if (/(income|lakh|poor|means|low income|financial aid|bpl|ration card)/i.test(queryLower)) {
    const incomeScholarships = SCHOLARSHIPS_DATA.filter(
      s => s.id === 'post-matric-sc' || s.id === 'reliance-foundation-ug' || s.id === 'pm-usp-central-sector' || s.id === 'hdfc-badhte-kadam'
    );

    responseText =
      `For students with annual household income under ₹2.5 to ₹4.5 Lakh, major verified options include:\n\n` +
      `• **Central Sector Scheme (NSP CSSS)**: ₹12,000–₹20,000/year for college students with family income under ₹4.5 Lakh and >80th percentile in Class 12.\n` +
      `• **Reliance Foundation UG Scholarship**: Grants up to ₹2,00,000 for undergraduate students with family income below ₹15 Lakh (strong priority for income under ₹2.5 Lakh).\n` +
      `• **Post-Matric Government Scholarships (SC/ST/OBC)**: 100% tuition reimbursement + living allowance for income below ₹2.5 Lakh.\n` +
      `• **HDFC Badhte Kadam**: Grants ₹30,000–₹1,00,000 for families facing financial crisis or low income (< ₹6 Lakh).`;

    incomeScholarships.forEach(s => {
      citations.push({
        scholarshipId: s.id,
        name: s.name,
        award: s.awardAmount.formatted,
        officialUrl: s.source.officialUrl,
        relevanceReason: 'Eligible for low to modest family income brackets',
      });
    });

    followUps.push(
      'How do I get an Income Certificate from the Tehsildar?',
      'Can I apply for both Govt and CSR scholarships?',
      'Which scholarships have no minimum marks requirement?'
    );
  }
  // 9. Inquiries about Documents & Application Procedure
  else if (/(document|certificate|tehsildar|how to apply|process|bonafide|caste cert)/i.test(queryLower)) {
    responseText =
      `To apply for Indian scholarships smoothly, here is the essential **5-Certificate Checklist**:\n\n` +
      `1. **Income Certificate**: Issued by the local Revenue Tehsildar / SDM for the current financial year. Must be in the parent's/guardian's name.\n` +
      `2. **College Bonafide Certificate**: Issued by your College Principal or Registrar on official institute letterhead.\n` +
      `3. **Caste / Category Certificate**: Required for SC, ST, OBC-NCL, or EWS quotas (issued by SDM/Tehsildar).\n` +
      `4. **Aadhaar-Seeded Bank Account**: Your bank account must be mapped to your Aadhaar via NPCI for Direct Benefit Transfer (DBT).\n` +
      `5. **Current Academic Fee Receipt & Marksheets**: Transcripts from Class 10 and 12, plus the latest college semester mark sheet.`;

    citations.push({
      scholarshipId: 'nsp-csss',
      name: 'NSP One-Time Registration (OTR)',
      award: 'Mandatory for all Govt Scholarships',
      officialUrl: 'https://scholarships.gov.in',
      relevanceReason: 'Official portal for submitting authentic documents',
    });

    followUps.push(
      'How to seed bank account with NPCI for DBT?',
      'What is an OTR in National Scholarship Portal?',
      'Show my document readiness checklist'
    );
  }
  // 10. Personalized Recommendations based on Active Profile
  else if (profile) {
    const scored = SCHOLARSHIPS_DATA.map(s => ({
      scholarship: s,
      evaluation: evaluateEligibility(s, profile),
    })).sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);

    const topMatches = scored.slice(0, 3);
    const eligibleCount = scored.filter(s => s.evaluation.status === 'eligible').length;

    responseText =
      `Based on your active profile (**${profile.academic.course}**, **${profile.location.state}**, family income **₹${profile.financialAndCategory.annualFamilyIncome.toLocaleString('en-IN')}**):\n\n` +
      `You match **${eligibleCount} scholarships** in our database! Here are your top personalized recommendations:\n\n` +
      topMatches
        .map(
          (m, idx) =>
            `${idx + 1}. **${m.scholarship.name}**\n` +
            `   • Award: ${m.scholarship.awardAmount.formatted}\n` +
            `   • Match Score: ${m.evaluation.matchScore}%\n` +
            `   • Status: ${m.evaluation.status === 'eligible' ? '✅ Full Match' : '⚠️ ' + m.evaluation.summaryMessage}`
        )
        .join('\n\n') +
      `\n\nWould you like a breakdown of the specific documents needed or help with the application timeline?`;

    topMatches.forEach(m => {
      citations.push({
        scholarshipId: m.scholarship.id,
        name: m.scholarship.name,
        award: m.scholarship.awardAmount.formatted,
        officialUrl: m.scholarship.source.officialUrl,
        relevanceReason: `${m.evaluation.matchScore}% Match based on your academic & financial profile`,
      });
    });

    followUps.push(
      `Compare ${topMatches[0]?.scholarship.name} and ${topMatches[1]?.scholarship.name}`,
      'Show my action plan and deadlines',
      'What are the renewal conditions for these scholarships?'
    );
  } else {
    // Generic overview
    responseText =
      `Welcome to the AI Scholarship Advisor! I am grounded in over ${SCHOLARSHIPS_DATA.length} verified central, state, and corporate scholarship schemes across India.\n\n` +
      `You can ask me questions like:\n` +
      `• "Find engineering scholarships for girls with family income under 3 LPA"\n` +
      `• "Are there any scholarships exclusively for boys?"\n` +
      `• "What documents do I need for AICTE Pragati?"\n` +
      `• "Scholarships for B.Tech Data Science students in Karnataka"\n` +
      `• "Scholarships with deadlines in the next 15 days"\n` +
      `• "How does the Document Vault protect my privacy?"\n\n` +
      `Try selecting one of the suggested prompts below or ask any specific question!`;

    followUps.push(
      'Scholarships for girls in engineering',
      'Are there any scholarships exclusively for boys?',
      'What documents do I need for AICTE Pragati?'
    );
  }

  return {
    id: `msg_${Date.now()}`,
    sender: 'assistant',
    content: responseText,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    citations,
    suggestedFollowUps: followUps,
    isOfflineFallback: true,
  };
}
