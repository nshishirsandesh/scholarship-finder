import React, { useState } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { exportUserDataAsJson, wipeAllUserData } from '../../services/storageService';
import { INDIAN_STATES } from '../../data/indianStates';
import { EducationLevel, Category, Religion } from '../../types/scholarship';
import {
  GraduationCap,
  MapPin,
  IndianRupee,
  ShieldAlert,
  Download,
  Trash2,
  Save,
} from 'lucide-react';

export const ProfileEditView: React.FC = () => {
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const { activeUserId, logout } = useAuth();
  const { showToast } = useToast();

  if (!profile) return null;

  // Form State initialized from current profile
  const [fullName, setFullName] = useState(profile.fullName);
  const [level, setLevel] = useState<EducationLevel>(profile.academic.level);
  const [course, setCourse] = useState(profile.academic.course);
  const [institutionName, setInstitutionName] = useState(profile.academic.institutionName);
  const [institutionType, setInstitutionType] = useState(profile.academic.institutionType);
  const [class10Percentage, setClass10Percentage] = useState(profile.academic.class10Percentage || 0);
  const [class12Percentage, setClass12Percentage] = useState(profile.academic.class12Percentage || 0);
  const [currentPercentage, setCurrentPercentage] = useState(profile.academic.currentPercentageOrCgpa || 0);

  const [state, setState] = useState(profile.location.state);
  const [district, setDistrict] = useState(profile.location.district);

  const [annualFamilyIncome, setAnnualFamilyIncome] = useState(profile.financialAndCategory.annualFamilyIncome);
  const [category, setCategory] = useState<Category>(profile.financialAndCategory.category);
  const [religion, setReligion] = useState<Religion>(profile.financialAndCategory.religion);
  const [gender, setGender] = useState(profile.financialAndCategory.gender);
  const [isSingleGirlChild, setIsSingleGirlChild] = useState(profile.financialAndCategory.isSingleGirlChild);
  const [isFirstGen, setIsFirstGen] = useState(profile.financialAndCategory.isFirstGenerationGraduate);
  const [isPwd, setIsPwd] = useState(profile.financialAndCategory.isPwd);
  const [pwdPercentage, setPwdPercentage] = useState(profile.financialAndCategory.pwdPercentage || 40);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      fullName,
      updatedAt: new Date().toISOString(),
      academic: {
        ...profile.academic,
        level,
        course,
        institutionName,
        institutionType,
        class10Percentage,
        class12Percentage,
        currentPercentageOrCgpa: currentPercentage,
      },
      location: {
        ...profile.location,
        state,
        district,
      },
      financialAndCategory: {
        ...profile.financialAndCategory,
        annualFamilyIncome,
        category,
        religion,
        gender,
        isSingleGirlChild,
        isFirstGenerationGraduate: isFirstGen,
        isPwd,
        pwdPercentage: isPwd ? pwdPercentage : undefined,
      },
    };

    const impact = await updateProfile(updated);
    if (impact.hasPositiveImpact) {
      showToast(impact.summaryMessage, 'success');
    } else {
      showToast('Profile updated successfully!', 'success');
    }
  };

  const handleExportData = () => {
    const jsonStr = exportUserDataAsJson(activeUserId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarship-finder-data-${activeUserId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Student data exported successfully', 'success');
  };

  const handleWipeData = async () => {
    if (confirm('Are you sure you want to clear all your saved scholarships, tracking data, and profile? This action is irreversible.')) {
      await wipeAllUserData(activeUserId);
      resetProfile();
      await logout();
      showToast('Local and cloud data cleared', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-3 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          User Settings & Security
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Student Profile & Data Privacy Controls
        </h2>
        <p className="text-xs text-slate-500">
          Editing parameters instantly recalculates matching percentages across the entire catalog and triggers the Profile Gap Detector.
        </p>
      </div>

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>Academic & Personal Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Education Level</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value as EducationLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            >
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enrolled Course / Degree</label>
            <input
              type="text"
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institution Type</label>
            <select
              value={institutionType}
              onChange={e => setInstitutionType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            >
              <option value="Central Govt">Central Govt (IIT, NIT)</option>
              <option value="State Govt">State Govt College</option>
              <option value="Govt-Aided">Govt-Aided Private</option>
              <option value="Private / Deemed">Private / Deemed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class 10 Score (%)</label>
            <input
              type="number"
              value={class10Percentage}
              onChange={e => setClass10Percentage(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class 12 Score (%)</label>
            <input
              type="number"
              value={class12Percentage}
              onChange={e => setClass12Percentage(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Degree (%)</label>
            <input
              type="number"
              value={currentPercentage}
              onChange={e => setCurrentPercentage(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Location & Domicile */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-t border-slate-100 pt-6">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Location & State Domicile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">State Domicile</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            >
              {INDIAN_STATES.map(s => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">District</label>
            <input
              type="text"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Financial & Social Categories */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-t border-slate-100 pt-6">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span>Financial Eligibility & Reservation Quota</span>
        </h3>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Annual Family Income</span>
            <span className="text-emerald-700 font-mono font-bold">
              ₹{annualFamilyIncome.toLocaleString('en-IN')} / year
            </span>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            >
              <option value="General">General</option>
              <option value="OBC-NCL">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Religion</label>
            <select
              value={religion}
              onChange={e => setReligion(e.target.value as Religion)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            >
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim (Minority)</option>
              <option value="Christian">Christian (Minority)</option>
              <option value="Sikh">Sikh (Minority)</option>
              <option value="Buddhist">Buddhist (Minority)</option>
              <option value="Jain">Jain (Minority)</option>
              <option value="Parsi">Parsi (Minority)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
            <input
              type="checkbox"
              checked={isSingleGirlChild}
              onChange={e => setIsSingleGirlChild(e.target.checked)}
              className="accent-emerald-600"
            />
            <span className="text-xs text-slate-800 font-medium">Single Girl Child Quota</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
            <input
              type="checkbox"
              checked={isFirstGen}
              onChange={e => setIsFirstGen(e.target.checked)}
              className="accent-emerald-600"
            />
            <span className="text-xs text-slate-800 font-medium">First Generation Graduate</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Changes & Recalculate Matches</span>
        </button>
      </form>

      {/* Privacy & Data Management */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>Data Privacy & Export</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your data is stored securely in your user session and synced with Firestore rules scoping access strictly to your user ID. You can export a copy of all your profile, document checklists, and application notes at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export My Data (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleWipeData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors border border-rose-200"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Clear Local & Cloud Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
