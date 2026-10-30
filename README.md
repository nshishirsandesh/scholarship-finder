# Scholarship Finder (India) 🎓🇮🇳
### AI-Powered Scholarship Discovery & Eligibility Engine for Indian Students
*Built for College Design Thinking Lab Demonstration and Real-World Higher Education Deployment.*

---

## 🚀 Key Highlights & Architectural Features

1. **Dual-Mode System (Zero-Friction Lab Demo + Live Firebase)**:
   - **Lab Demo Mode (Default)**: Explicitly labelled ambient banner with 1-click test personas (**Ananya** - B.Tech OBC Girl, **Rahul** - SC Humanities, **Priya** - MBBS Merit) and test phone OTP (`+91 99999 99999` with code `123456`) to evaluate all features instantly without SMS costs or blocked quotas.
   - **Live Mode**: Real Firebase Phone Authentication with SMS OTP via `recaptchaVerifier` and per-user isolated Cloud Firestore synchronization (`users/{uid}/...`).
2. **Deterministic & Transparent Eligibility Engine**:
   - 10-point transparent rule checks returning itemized criteria breakdowns: **Satisfied Requirements** (user data vs. threshold), **Disqualifying Shortfalls**, and **Missing Info**.
3. **Curated & Verified 25 Authentic Indian Scholarships**:
   - Includes Central Govt (NSP Central Sector Scheme, Post-Matric SC/ST/OBC), State schemes (Karnataka SSP, MahaDBT, UP Saksham), Girls in STEM (AICTE Pragati, Kotak Kanya, Infosys STEM Stars), and Corporate CSR (Reliance Foundation, Tata Trusts, HDFC Badhte Kadam, Siemens).
4. **Natural-Language Search & 4-Way Comparison**:
   - Understands queries like *"scholarships for girls in engineering under 2 lakhs in karnataka"*.
   - Side-by-side comparison matrix for up to 4 scholarships.
5. **Productivity & Planning**:
   - **Kanban Application Tracker**: Stages from `Saved` -> `Preparing Documents` -> `Applied` -> `Under Review` -> `Awarded`.
   - **Document Vault**: Readiness scoring based on Indian certificates (Income, Domicile, Caste, Bonafide, Fee Receipt, Aadhaar Seeded Bank Account).
   - **Funding Gap Calculator**: Compares tuition + living expenses against realistic combined expected aid (factoring in Indian anti-double-dipping rules).
   - **Deadlines Calendar**: Real-time countdowns (`T-minus 14 days`), in-app alerts, `.ics` calendar download, and Google Calendar export.
6. **Grounded AI Scholarship Advisor**:
   - Powered by **Gemini 1.5 Flash** when `VITE_GEMINI_API_KEY` is set.
   - Includes an intelligent **Offline Heuristic Knowledge Engine** grounded in the verified catalog for 100% reliability with zero API keys.

---

## 🛠️ Quickstart

### 1. Development Server
```bash
npm install
npm run dev
```

### 2. Run Test Suite
```bash
npm test
```
*Runs 15 automated Vitest unit & integration tests across the eligibility engine, query parser, gap detector, funding planner, persistence, and end-to-end user journey.*

### 3. Production Build
```bash
npm run build
```

---

## ⚙️ Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```env
# Optional: Firebase Live Authentication & Firestore
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Optional: Google Gemini API (AI Advisor)
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```
*(If left unset, the application automatically runs in Lab Demo Mode with simulated phone login and offline heuristic knowledge engine).*

---

## 🧪 Design Thinking Lab Evaluator Cheat Sheet

- **1-Click Testing**: Click any persona badge in the top banner (**Ananya**, **Rahul**, or **Priya**) to see recommendations and eligibility scores update instantly.
- **Search**: Press `Cmd+K` or click the search bar, then click one of the suggested query chips like *"Scholarships for girls in engineering"*.
- **Transparency Audit**: Click **Why You Match** on any scholarship card to view the itemized checklist of satisfied and missing criteria.
- **Comparison**: Click **Compare** on 2 to 4 cards, then click **Compare Now** in the sticky bottom dock.
- **Application Tracker**: Navigate to **My Applications** to test the 5-stage Kanban board, update application reference numbers, and record submission notes.
- **Funding Gap**: Click **Funding Plan** to customize tuition/living expenses and analyze achievable funding combinations.
