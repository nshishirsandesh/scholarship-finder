import React from 'react';
import { useComparison } from '../../context/ComparisonContext';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { Scale, X, ArrowRight } from 'lucide-react';

export const ComparisonBar: React.FC = () => {
  const { selectedIds, removeFromCompare, clearCompare, openComparisonModal } = useComparison();

  if (selectedIds.length === 0) return null;

  const selectedScholarships = selectedIds
    .map(id => SCHOLARSHIPS_DATA.find(s => s.id === id))
    .filter(Boolean);

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-slideUp text-slate-900">
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 shrink-0 pr-2 border-r border-slate-200">
          <Scale className="w-4 h-4 text-indigo-600" />
          <span>Compare ({selectedIds.length}/4):</span>
        </div>

        {selectedScholarships.map(s => s && (
          <div
            key={s.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 shrink-0"
          >
            <span className="truncate max-w-[140px] sm:max-w-[200px] font-medium">{s.name}</span>
            <button
              onClick={() => removeFromCompare(s.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={clearCompare}
          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
        >
          Clear
        </button>
        <button
          onClick={openComparisonModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
