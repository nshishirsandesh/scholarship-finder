import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { EducationLevel, Category, ProviderType } from '../../types/scholarship';
import { INDIAN_STATES } from '../../data/indianStates';

export interface FilterState {
  level: EducationLevel | 'ALL';
  category: Category | 'ALL';
  gender: 'All' | 'Female' | 'Male' | 'Transgender / Other';
  providerType: ProviderType | 'ALL';
  state: string;
  maxIncome: number;
  minMarks: number;
  sortBy: 'match' | 'deadline' | 'amount' | 'name';
}

export const INITIAL_FILTERS: FilterState = {
  level: 'ALL',
  category: 'ALL',
  gender: 'All',
  providerType: 'ALL',
  state: 'ALL',
  maxIncome: 0,
  minMarks: 0,
  sortBy: 'match',
};

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm text-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Filters & Sorting
          </span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sort Results</label>
        <select
          value={filters.sortBy}
          onChange={e => update('sortBy', e.target.value as any)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
        >
          <option value="match">Best Eligibility Match (Highest Score)</option>
          <option value="deadline">Application Deadline (Urgent First)</option>
          <option value="amount">Award Amount (Highest First)</option>
          <option value="name">Scholarship Name (A-Z)</option>
        </select>
      </div>

      {/* Education Level */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Education Level</label>
        <select
          value={filters.level}
          onChange={e => update('level', e.target.value as any)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
        >
          <option value="ALL">All Levels</option>
          <option value="Class 10">Class 10 (Secondary)</option>
          <option value="Class 11">Class 11</option>
          <option value="Class 12">Class 12 (Higher Secondary)</option>
          <option value="Diploma">Diploma / Polytechnic</option>
          <option value="Undergraduate">Undergraduate (B.Tech, MBBS, etc.)</option>
          <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, etc.)</option>
          <option value="Doctorate">Doctorate / Ph.D.</option>
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender Eligibility</label>
        <select
          value={filters.gender}
          onChange={e => update('gender', e.target.value as any)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
        >
          <option value="All">All Genders</option>
          <option value="Female">Female Students Only</option>
          <option value="Male">Male</option>
          <option value="Transgender / Other">Transgender / Other</option>
        </select>
      </div>

      {/* Social Category */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Social Category</label>
        <select
          value={filters.category}
          onChange={e => update('category', e.target.value as any)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="General">General / Open</option>
          <option value="OBC-NCL">OBC-NCL</option>
          <option value="SC">SC (Scheduled Caste)</option>
          <option value="ST">ST (Scheduled Tribe)</option>
          <option value="EWS">EWS</option>
        </select>
      </div>

      {/* Provider Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provider Authority</label>
        <select
          value={filters.providerType}
          onChange={e => update('providerType', e.target.value as any)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
        >
          <option value="ALL">All Provider Types</option>
          <option value="Central Government">Central Government (NSP / Ministries)</option>
          <option value="State Government">State Government Portals</option>
          <option value="Corporate CSR">Corporate CSR Foundations</option>
          <option value="Private Foundation">Private Philanthropic Trusts</option>
        </select>
      </div>

      {/* State / Domicile */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / Domicile</label>
        <select
          value={filters.state}
          onChange={e => update('state', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
        >
          <option value="ALL">Pan-India (All States)</option>
          {INDIAN_STATES.map(s => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Income Filter */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700">Max Family Income</span>
          <span className="text-emerald-700 font-mono font-bold">
            {filters.maxIncome === 0 ? 'Any Income' : `≤ ₹${(filters.maxIncome / 100000).toFixed(1)}L`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1000000}
          step={50000}
          value={filters.maxIncome}
          onChange={e => update('maxIncome', parseInt(e.target.value, 10))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Any</span>
          <span>₹2.5L</span>
          <span>₹5.0L</span>
          <span>₹10L</span>
        </div>
      </div>
    </div>
  );
};
