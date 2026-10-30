import React, { useState } from 'react';
import { UserProfile } from '../../types/user';
import { INDIAN_STATES } from '../../data/indianStates';
import { EducationLevel, Category, Religion } from '../../types/scholarship';
import {
  GraduationCap,
  MapPin,
  IndianRupee,
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileCheck,
  ShieldCheck,
  Edit2,
  Info,
} from 'lucide-react';
import { DEMO_PERSONAS } from '../../data/personas';

interface OnboardingWizardProps {
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState('');

  // Form State
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [level, setLevel] = useState<EducationLevel>(initialProfile?.academic.level || 'Undergraduate');
  const [course, setCourse] = useState(initialProfile?.academic.course || '');
  const [currentYear, setCurrentYear] = useState(initialProfile?.academic.currentYear || '1st Year');
  const [institutionName, setInstitutionName] = useState(initialProfile?.academic.institutionName || '');
  const [institutionType, setInstitutionType] = useState<'Central Govt' | 'State Govt' | 'Govt-Aided' | 'Private / Deemed'>(
    initialProfile?.academic.institutionType || 'State Govt'
  );
  const [class10Percentage, setClass10Percentage] = useState<number | string>(initialProfile?.academic.class10Percentage ?? '');
  const [class12Percentage, setClass12Percentage] = useState<number | string>(initialProfile?.academic.class12Percentage ?? '');
  const [currentPercentage, setCurrentPercentage] = useState<number | string>(initialProfile?.academic.currentPercentageOrCgpa ?? '');

  // Location State
  const [state, setState] = useState(initialProfile?.location.state || '');
  const [district, setDistrict] = useState(initialProfile?.location.district || '');
  const [areaType, setAreaType] = useState<'Rural' | 'Semi-Urban' | 'Urban'>(initialProfile?.location.areaType || 'Urban');

  // Financial & Category State
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState<number>(initialProfile?.financialAndCategory.annualFamilyIncome ?? 250000);
  const [category, setCategory] = useState<Category>(initialProfile?.financialAndCategory.category || 'General');
  const [religion, setReligion] = useState<Religion>(initialProfile?.financialAndCategory.religion || 'Hindu');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Transgender / Other'>(initialProfile?.financialAndCategory.gender || 'Female');
  const [isPwd, setIsPwd] = useState<boolean>(initialProfile?.financialAndCategory.isPwd ?? false);
  const [pwdPercentage, setPwdPercentage] = useState<number>(initialProfile?.financialAndCategory.pwdPercentage || 40);
  const [isSingleGirlChild, setIsSingleGirlChild] = useState<boolean>(initialProfile?.financialAndCategory.isSingleGirlChild ?? false);
  const [isFirstGenerationGraduate, setIsFirstGenerationGraduate] = useState<boolean>(initialProfile?.financialAndCategory.isFirstGenerationGraduate ?? false);
  const [isWardOfDefense, setIsWardOfDefense] = useState<boolean>(initialProfile?.financialAndCategory.isWardOfDefenseOrExServicemen ?? false);
  const [isWardOfFarmer, setIsWardOfFarmer] = useState<boolean>(initialProfile?.financialAndCategory.isWardOfFarmer ?? false);

  // Aspirations & Costs State
  const [fieldsOfInterest, setFieldsOfInterest] = useState<string[]>(
    initialProfile?.aspirations.fieldsOfInterest || ['Computer Science', 'Artificial Intelligence', 'Data Science']
  );
  const [intendsToStudyAbroad, setIntendsToStudyAbroad] = useState<boolean>(initialProfile?.aspirations.intendsToStudyAbroad ?? false);
  const [financialUrgency, setFinancialUrgency] = useState<'High' | 'Moderate' | 'Standard'>(
    initialProfile?.aspirations.financialUrgency || 'Moderate'
  );
  const [estimatedAnnualTuitionCost, setEstimatedAnnualTuitionCost] = useState<number>(
    initialProfile?.aspirations.estimatedAnnualTuitionCost || 85000
  );
  const [estimatedAnnualLivingCost, setEstimatedAnnualLivingCost] = useState<number>(
    initialProfile?.aspirations.estimatedAnnualLivingCost || 45000
  );

  const selectedStateObj = INDIAN_STATES.find(s => s.name === state) || INDIAN_STATES[0];

  const validateStep = (stepNum: number): boolean => {
    setValidationError('');
    if (stepNum === 1) {
      if (!fullName.trim()) {
        setValidationError('Please enter your full name before proceeding.');
        return false;
      }
      if (!course.trim()) {
        setValidationError('Please specify your enrolled degree / course / branch.');
        return false;
      }
      if (!institutionName.trim()) {
        setValidationError('Please enter your college or school name.');
        return false;
      }
    }
    if (stepNum === 2) {
      if (!state) {
        setValidationError('Please select your state of domicile.');
        return false;
      }
      if (!district.trim()) {
        setValidationError('Please enter your home district.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    else handleFinish();
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePreFillPersona = (personaId: string) => {
    const p = DEMO_PERSONAS.find(item => item.id === personaId);
    if (!p) return;
    setFullName(p.profile.fullName);
    setLevel(p.profile.academic.level);
    setCourse(p.profile.academic.course);
    setCurrentYear(p.profile.academic.currentYear);
    setInstitutionName(p.profile.academic.institutionName);
    setInstitutionType(p.profile.academic.institutionType);
    setClass10Percentage(p.profile.academic.class10Percentage || 85);
    setClass12Percentage(p.profile.academic.class12Percentage || 80);
    setCurrentPercentage(p.profile.academic.currentPercentageOrCgpa || 75);

    setState(p.profile.location.state);
    setDistrict(p.profile.location.district);
    setAreaType(p.profile.location.areaType);

    setAnnualFamilyIncome(p.profile.financialAndCategory.annualFamilyIncome);
    setCategory(p.profile.financialAndCategory.category);
    setReligion(p.profile.financialAndCategory.religion);
    setGender(p.profile.financialAndCategory.gender);
    setIsPwd(p.profile.financialAndCategory.isPwd);
    setIsSingleGirlChild(p.profile.financialAndCategory.isSingleGirlChild);
    setIsFirstGenerationGraduate(p.profile.financialAndCategory.isFirstGenerationGraduate);
    setIsWardOfDefense(p.profile.financialAndCategory.isWardOfDefenseOrExServicemen || false);
    setIsWardOfFarmer(p.profile.financialAndCategory.isWardOfFarmer || false);

    setFieldsOfInterest(p.profile.aspirations.fieldsOfInterest);
    setIntendsToStudyAbroad(p.profile.aspirations.intendsToStudyAbroad);
    setFinancialUrgency(p.profile.aspirations.financialUrgency);
    setEstimatedAnnualTuitionCost(p.profile.aspirations.estimatedAnnualTuitionCost);
    setEstimatedAnnualLivingCost(p.profile.aspirations.estimatedAnnualLivingCost);
  };

  const handleFinish = () => {
    const completedProfile: UserProfile = {
      uid: initialProfile?.uid || `student_${Date.now()}`,
      fullName: fullName.trim() || 'Student Applicant',
      phoneNumber: initialProfile?.phoneNumber || '+91 98765 43210',
      isOnboardingCompleted: true,
      updatedAt: new Date().toISOString(),
      academic: {
        level,
        course: course.trim(),
        currentYear,
        institutionName: institutionName.trim(),
        institutionType,
        class10Percentage: class10Percentage !== '' ? Number(class10Percentage) : undefined,
        class12Percentage: class12Percentage !== '' ? Number(class12Percentage) : undefined,
        currentPercentageOrCgpa: currentPercentage !== '' ? Number(currentPercentage) : undefined,
      },
      location: {
        state,
        district: district.trim(),
        areaType,
      },
      financialAndCategory: {
        annualFamilyIncome,
        category,
        religion,
        gender,
        isPwd,
        pwdPercentage: isPwd ? pwdPercentage : undefined,
        isSingleGirlChild,
        isFirstGenerationGraduate,
        isWardOfDefenseOrExServicemen: isWardOfDefense,
        isWardOfFarmer,
      },
      aspirations: {
        fieldsOfInterest,
        intendsToStudyAbroad,
        financialUrgency,
        estimatedAnnualTuitionCost,
        estimatedAnnualLivingCost,
      },
    };
    onComplete(completedProfile);
  };

  const steps = [
    { num: 1, title: 'Academic', icon: <GraduationCap className="w-4 h-4" /> },
    { num: 2, title: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { num: 3, title: 'Financial & Quota', icon: <IndianRupee className="w-4 h-4" /> },
    { num: 4, title: 'Aspirations & Need', icon: <Compass className="w-4 h-4" /> },
    { num: 5, title: 'Review & Confirm', icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Personalized Eligibility Setup
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Student Profile Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete your academic and financial profile to receive 100% transparent, deterministic scholarship matches.
          </p>
        </div>

        {/* Quick Sample Fill for Evaluation */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-600 px-1 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Quick Sample:
          </span>
          {DEMO_PERSONAS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePreFillPersona(p.id)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] text-slate-700 hover:text-emerald-800 font-medium transition-colors shadow-2xs"
              title={`Load sample profile: ${p.name}`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="p-3 my-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Client-Side Storage:</strong> Your student credentials are stored strictly in your local browser profile. No passwords or personal files are transmitted externally.
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 my-6">
        {steps.map(s => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;
          return (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < currentStep || validateStep(currentStep)) {
                  setCurrentStep(s.num);
                }
              }}
              className={`cursor-pointer p-2 rounded-xl text-center border transition-all ${
                isCurrent
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                  : isDone
                  ? 'bg-slate-50 border-slate-200 text-slate-700 font-medium'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : s.icon}
                <span className="text-xs">Step {s.num}</span>
              </div>
              <div className="text-[10px] truncate">{s.title}</div>
            </div>
          );
        })}
      </div>

      {validationError && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Content Steps */}
      <div className="space-y-6 min-h-[360px]">
        {/* STEP 1: Academic */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Education Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value as EducationLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                >
                  <option value="Class 10">Class 10 (Secondary)</option>
                  <option value="Class 11">Class 11 (Higher Secondary 1st Year)</option>
                  <option value="Class 12">Class 12 (Higher Secondary 2nd Year)</option>
                  <option value="Diploma">Diploma / Polytechnic</option>
                  <option value="Undergraduate">Undergraduate (B.Tech, MBBS, B.Sc, B.Com, etc.)</option>
                  <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MBA, etc.)</option>
                  <option value="Doctorate">Doctorate / Ph.D.</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Degree / Course / Stream <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                  placeholder="e.g. B.Tech Computer Science, MBBS, B.Sc Physics"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Year of Study
                </label>
                <select
                  value={currentYear}
                  onChange={e => setCurrentYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                >
                  <option value="1st Year">1st Year (Fresh Admission)</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  College / Institution Name
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                  placeholder="e.g. JNTU Hyderabad, NIT Warangal, Osmania University"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Institution Type
                </label>
                <select
                  value={institutionType}
                  onChange={e => setInstitutionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                >
                  <option value="Central Govt">Central Government (IIT, NIT, Central Univ)</option>
                  <option value="State Govt">State Government College / University</option>
                  <option value="Govt-Aided">Government-Aided Private Institution</option>
                  <option value="Private / Deemed">Private / Deemed University</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class 10 Score (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  placeholder="e.g. 88.5"
                  value={class10Percentage}
                  onChange={e => setClass10Percentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class 12 Score (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  placeholder="e.g. 84.0"
                  value={class12Percentage}
                  onChange={e => setClass12Percentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Degree / CGPA (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  placeholder="e.g. 80.0"
                  value={currentPercentage}
                  onChange={e => setCurrentPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                State / UT of Domicile <span className="text-rose-500">*</span>
              </label>
              <select
                value={state}
                onChange={e => {
                  setState(e.target.value);
                  const newState = INDIAN_STATES.find(s => s.name === e.target.value);
                  if (newState && newState.districts.length > 0) {
                    setDistrict(newState.districts[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
              >
                <option value="">-- Select Your State of Domicile --</option>
                {INDIAN_STATES.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name} {s.isUT ? '(UT)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                State domicile determines access to state schemes (e.g. Telangana ePASS, Karnataka SSP, MahaDBT).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  District of Residence
                </label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                >
                  {selectedStateObj.districts.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Area Classification
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Rural', 'Semi-Urban', 'Urban'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAreaType(type)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        areaType === type
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Financial & Category Quota */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            {/* Income Slider & Presets */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700">Annual Family Income</span>
                  <p className="text-[11px] text-slate-500">
                    Gross family income (used to evaluate income ceilings like ≤₹2.5L or ≤₹8L)
                  </p>
                </div>
                <div className="text-base font-extrabold text-emerald-700 font-mono">
                  ₹{annualFamilyIncome.toLocaleString('en-IN')} / yr
                </div>
              </div>

              <input
                type="range"
                min={50000}
                max={1200000}
                step={25000}
                value={annualFamilyIncome}
                onChange={e => setAnnualFamilyIncome(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: '< ₹1.5L', val: 120000 },
                  { label: '₹1.5L - ₹2.5L', val: 200000 },
                  { label: '₹2.5L - ₹4.5L', val: 350000 },
                  { label: '₹4.5L - ₹6.0L', val: 550000 },
                  { label: '₹6.0L - ₹8.0L', val: 750000 },
                ].map(bracket => (
                  <button
                    key={bracket.label}
                    type="button"
                    onClick={() => setAnnualFamilyIncome(bracket.val)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-[11px] text-slate-700 font-medium shadow-2xs transition-colors"
                  >
                    {bracket.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sensitive field explanation notice */}
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Transparency:</strong> Social category, religion, and gender are evaluated strictly against confirmed government and foundation eligibility criteria (e.g., girls-only STEM awards, SC/ST fee reimbursements, or minority schemes).
              </span>
            </div>

            {/* Category & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Social Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                >
                  <option value="General">General / Open Merit</option>
                  <option value="OBC-NCL">OBC-NCL (Non-Creamy Layer)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Transgender / Other">Transgender / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Religious Community
                </label>
                <select
                  value={religion}
                  onChange={e => setReligion(e.target.value as Religion)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                >
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim (Minority Scheme)</option>
                  <option value="Christian">Christian (Minority Scheme)</option>
                  <option value="Sikh">Sikh (Minority Scheme)</option>
                  <option value="Buddhist">Buddhist (Minority Scheme)</option>
                  <option value="Jain">Jain (Minority Scheme)</option>
                  <option value="Parsi">Parsi (Minority Scheme)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Quotas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isSingleGirlChild}
                  onChange={e => setIsSingleGirlChild(e.target.checked)}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Single Girl Child Quota</span>
                  <span className="text-[11px] text-slate-500">Only female child in the family (qualifies for UGC Single Girl Child scheme)</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isFirstGenerationGraduate}
                  onChange={e => setIsFirstGenerationGraduate(e.target.checked)}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">First Generation College Graduate</span>
                  <span className="text-[11px] text-slate-500">First person in immediate family pursuing a higher education degree</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isWardOfDefense}
                  onChange={e => setIsWardOfDefense(e.target.checked)}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Ward of Armed Forces / Ex-Servicemen</span>
                  <span className="text-[11px] text-slate-500">Parent served in Indian Defense or Paramilitary forces</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isPwd}
                  onChange={e => setIsPwd(e.target.checked)}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Person with Benchmark Disability (PwD)</span>
                  <span className="text-[11px] text-slate-500">Possess UDID / CMO disability certificate (≥40%)</span>
                </div>
              </label>
            </div>

            {isPwd && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Disability Percentage</span>
                  <span className="font-bold text-emerald-700">{pwdPercentage}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={pwdPercentage}
                  onChange={e => setPwdPercentage(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[10px] text-slate-500">Standard government benchmark is 40%+</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Aspirations & Educational Costs */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estimated Annual College Tuition (₹)
                </label>
                <input
                  type="number"
                  step={5000}
                  value={estimatedAnnualTuitionCost}
                  onChange={e => setEstimatedAnnualTuitionCost(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                  placeholder="e.g. 85000"
                />
                <p className="text-[11px] text-slate-500 mt-1">Used to compute your net funding gap</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estimated Annual Living & Hostel Cost (₹)
                </label>
                <input
                  type="number"
                  step={5000}
                  value={estimatedAnnualLivingCost}
                  onChange={e => setEstimatedAnnualLivingCost(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
                  placeholder="e.g. 45000"
                />
                <p className="text-[11px] text-slate-500 mt-1">Hostel, mess, books & equipment expenses</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Financial Urgency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'High', desc: 'At risk of dropping out without aid' },
                  { id: 'Moderate', desc: 'Need grant to manage living/hostel' },
                  { id: 'Standard', desc: 'Seeking merit honor & tuition support' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFinancialUrgency(opt.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      financialUrgency === opt.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="font-bold text-xs block">{opt.id} Urgency</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={intendsToStudyAbroad}
                onChange={e => setIntendsToStudyAbroad(e.target.checked)}
                className="mt-0.5 accent-emerald-600"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  Aspires to pursue Master’s / Ph.D. Abroad
                </span>
                <span className="text-[11px] text-slate-500">
                  Unlocks schemes like National Overseas Scholarship (NOS) and Ambedkar Overseas Vidya Nidhi
                </span>
              </div>
            </label>
          </div>
        )}

        {/* STEP 5: Review & Confirmation */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Review Your Information Before Matching</span>
                <p className="mt-0.5 leading-relaxed text-slate-700">
                  Your profile details will be deterministically evaluated against our database of verified government, state, and CSR scholarship criteria. You can edit any parameter now or in your Profile tab later.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Card 1: Academic */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    Academic Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-slate-600 space-y-1">
                  <div><strong>Name:</strong> {fullName || 'Student Applicant'}</div>
                  <div><strong>Level:</strong> {level} • {currentYear}</div>
                  <div><strong>Course:</strong> {course}</div>
                  <div><strong>College:</strong> {institutionName} ({institutionType})</div>
                  <div>
                    <strong>Academic Scores:</strong>{' '}
                    Class 10: {class10Percentage !== '' ? `${class10Percentage}%` : 'Not provided'} •{' '}
                    Class 12: {class12Percentage !== '' ? `${class12Percentage}%` : 'Not provided'} •{' '}
                    Current: {currentPercentage !== '' ? `${currentPercentage}%` : 'Not provided'}
                  </div>
                </div>
              </div>

              {/* Card 2: Location */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Location & Domicile
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-slate-600 space-y-1">
                  <div><strong>Domicile State:</strong> {state}</div>
                  <div><strong>District:</strong> {district}</div>
                  <div><strong>Area Classification:</strong> {areaType}</div>
                </div>
              </div>

              {/* Card 3: Financial & Category */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Financial & Category
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-slate-600 space-y-1">
                  <div><strong>Annual Family Income:</strong> ₹{annualFamilyIncome.toLocaleString('en-IN')}</div>
                  <div><strong>Category:</strong> {category} • <strong>Gender:</strong> {gender}</div>
                  <div><strong>Religion:</strong> {religion}</div>
                  <div>
                    <strong>Quotas:</strong>{' '}
                    {[
                      isSingleGirlChild && 'Single Girl Child',
                      isFirstGenerationGraduate && 'First-Gen Graduate',
                      isWardOfDefense && 'Ward of Defense',
                      isPwd && `PwD (${pwdPercentage}%)`,
                    ].filter(Boolean).join(', ') || 'None specified'}
                  </div>
                </div>
              </div>

              {/* Card 4: Costs & Aspirations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-purple-600" />
                    Costs & Aspirations
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-slate-600 space-y-1">
                  <div><strong>Annual Tuition:</strong> ₹{estimatedAnnualTuitionCost.toLocaleString('en-IN')}</div>
                  <div><strong>Living / Hostel:</strong> ₹{estimatedAnnualLivingCost.toLocaleString('en-IN')}</div>
                  <div><strong>Total Need:</strong> ₹{(estimatedAnnualTuitionCost + estimatedAnnualLivingCost).toLocaleString('en-IN')} / yr</div>
                  <div><strong>Study Abroad:</strong> {intendsToStudyAbroad ? 'Yes' : 'No'} • <strong>Urgency:</strong> {financialUrgency}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {currentStep > 1 && currentStep < 5 && (
            <button
              type="button"
              onClick={() => {
                if (validateStep(currentStep)) setCurrentStep(5);
              }}
              className="text-xs text-slate-500 hover:text-emerald-700 font-medium underline underline-offset-2 hidden sm:inline"
            >
              Skip optional & Review
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors shadow-sm"
          >
            <span>{currentStep === 5 ? 'Confirm & Discover Scholarships' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
