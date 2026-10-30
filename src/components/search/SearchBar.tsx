import React, { useState, useEffect } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { parseNaturalLanguageQuery, ParsedNLQuery } from '../../engine/nlQueryParser';

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  onParsedQueryChange?: (parsed: ParsedNLQuery | null) => void;
}

const POPULAR_SUGGESTIONS = [
  'Scholarships for girls in engineering',
  'Family income under 2.5 lakh',
  'Post-Matric SC scholarship',
  'Karnataka SSP scholarships',
  'Merit scholarships above 85%',
  'Medical MBBS students',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChange,
  onParsedQueryChange,
}) => {
  const [parsed, setParsed] = useState<ParsedNLQuery | null>(null);

  useEffect(() => {
    if (query.trim().length > 3) {
      const result = parseNaturalLanguageQuery(query);
      setParsed(result);
      if (onParsedQueryChange) onParsedQueryChange(result);
    } else {
      setParsed(null);
      if (onParsedQueryChange) onParsedQueryChange(null);
    }
  }, [query, onParsedQueryChange]);

  const handleClear = () => {
    onChange('');
    setParsed(null);
    if (onParsedQueryChange) onParsedQueryChange(null);
  };

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => onChange(e.target.value)}
          placeholder="Search by name, provider, or natural phrase (e.g., 'scholarships for girls in engineering under 2 lakhs')..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Natural Language Insights Pill */}
      {parsed && parsed.explanation.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs animate-fadeIn">
          <span className="text-emerald-800 font-semibold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI Query Filter:
          </span>
          {parsed.explanation.map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200 text-[11px] font-medium shadow-2xs"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Popular Suggestion Chips */}
      {!query && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium">Try searching:</span>
          {POPULAR_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => onChange(s)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
