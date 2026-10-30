import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse shadow-sm">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-100 rounded-md w-3/4"></div>
        <div className="h-3 bg-slate-100/70 rounded-md w-1/2"></div>
      </div>
      <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
    </div>
    <div className="h-10 bg-slate-50 rounded-lg"></div>
    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
      <div className="h-8 bg-slate-100 rounded-lg"></div>
      <div className="h-8 bg-slate-100 rounded-lg"></div>
    </div>
  </div>
);

export const MetricSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 animate-pulse shadow-sm">
    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
    <div className="h-8 bg-slate-100 rounded w-1/2"></div>
    <div className="h-3 bg-slate-100/70 rounded w-2/3"></div>
  </div>
);
