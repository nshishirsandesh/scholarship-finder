import React from 'react';

interface BrandLogoProps {
  theme?: 'dark' | 'light';
  isCollapsed?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'dark',
  isCollapsed = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Signature SVG Brand Icon */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-0.5 shadow-md shadow-emerald-500/20 group">
        <div className="w-full h-full rounded-[10px] bg-midnight-950/40 backdrop-blur-xs flex items-center justify-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-teal-300/30 opacity-60" />

          {/* Custom SVG Symbol: Mortarboard + Growth Leaf + Star */}
          <svg
            className="w-5 h-5 text-emerald-300 relative z-10 transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Mortarboard Cap */}
            <path d="M22 9L12 4L2 9L12 14L22 9Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M6 11.5V16.5C6 16.5 8.5 19 12 19C15.5 19 18 16.5 18 16.5V11.5" />
            <path d="M22 9V15" />
            {/* Upward Growth Sprout / Chevron in the center */}
            <path d="M12 11V7" stroke="#34d399" strokeWidth="2" />
            <path d="M10 9L12 7L14 9" stroke="#34d399" strokeWidth="2" />
            {/* Achievement Star pip */}
            <circle cx="12" cy="14" r="1.5" fill="#f59e0b" stroke="none" />
          </svg>
        </div>
      </div>

      {/* Wordmark (hidden if collapsed) */}
      {!isCollapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-extrabold text-base tracking-tight leading-none ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Scholarship<span className="text-emerald-400">Finder</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              India
            </span>
          </div>
          <span
            className={`text-[10px] font-medium tracking-wide mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            AI Discovery & Grants
          </span>
        </div>
      )}
    </div>
  );
};
