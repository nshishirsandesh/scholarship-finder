import React, { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { SearchFilters, FilterState, INITIAL_FILTERS } from './SearchFilters';
import { ScholarshipCard } from './ScholarshipCard';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { useUserProfile } from '../../context/UserProfileContext';
import { evaluateEligibility } from '../../engine/eligibilityEngine';
import { ParsedNLQuery } from '../../engine/nlQueryParser';
import { Scholarship } from '../../types/scholarship';
import { EligibilityResult } from '../../types/eligibility';
import { SlidersHorizontal, SearchX, RotateCcw, Info, X } from 'lucide-react';

interface DiscoverViewProps {
  onOpenAudit: (scholarship: Scholarship, eligibility: EligibilityResult) => void;
  searchFocusRef?: React.RefObject<HTMLInputElement>;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onOpenAudit }) => {
  const { profile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedNL, setParsedNL] = useState<ParsedNLQuery | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset pagination when search or filters change
  React.useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, filters]);

  // Detect male-specific search intent
  const isMaleQueryActive = useMemo(() => {
    if (parsedNL?.detectedGender === 'Male') return true;
    if (filters.gender === 'Male') return true;
    if (/\b(boys?|male|men)\b/i.test(searchQuery)) return true;
    return false;
  }, [parsedNL, filters.gender, searchQuery]);

  const isFemaleQueryActive = useMemo(() => {
    if (parsedNL?.detectedGender === 'Female') return true;
    if (filters.gender === 'Female') return true;
    if (/\b(girls?|female|women|woman|kanya|beti)\b/i.test(searchQuery)) return true;
    return false;
  }, [parsedNL, filters.gender, searchQuery]);

  // Filter & Search Logic
  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATA.filter(s => {
      // 1. Text Search & NL Tokens
      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase();
        const matchesBasic =
          s.name.toLowerCase().includes(qLower) ||
          s.provider.toLowerCase().includes(qLower) ||
          s.shortDescription.toLowerCase().includes(qLower) ||
          s.tags.some(t => t.toLowerCase().includes(qLower)) ||
          (s.criteria.eligibleCourses && s.criteria.eligibleCourses.some(c => c.toLowerCase().includes(qLower)));

        if (!matchesBasic) {
          if (parsedNL && parsedNL.detectedKeywords.length > 0) {
            const hasKeywordMatch = parsedNL.detectedKeywords.some(
              kw =>
                s.name.toLowerCase().includes(kw) ||
                s.tags.some(t => t.toLowerCase().includes(kw)) ||
                (s.criteria.eligibleCourses && s.criteria.eligibleCourses.some(c => c.toLowerCase().includes(kw)))
            );
            if (!hasKeywordMatch) return false;
          } else {
            return false;
          }
        }
      }

      // 2. Education Level Filter
      const activeLevel = parsedNL?.detectedLevel || (filters.level !== 'ALL' ? filters.level : null);
      if (activeLevel) {
        if (!s.criteria.eligibleLevels.includes('ALL') && !s.criteria.eligibleLevels.includes(activeLevel)) {
          return false;
        }
      }

      // 3. Category Filter
      const activeCategory = parsedNL?.detectedCategory || (filters.category !== 'ALL' ? filters.category : null);
      if (activeCategory) {
        if (activeCategory === 'Minority') {
          if (s.criteria.eligibleReligions && !s.criteria.eligibleReligions.includes('ALL')) {
            // matches minority
          }
        } else if (!s.criteria.eligibleCategories.includes('ALL') && !s.criteria.eligibleCategories.includes(activeCategory as any)) {
          return false;
        }
      }

      // 4. Gender Filter
      if (isFemaleQueryActive) {
        if (!s.criteria.eligibleGenders.includes('All') && !s.criteria.eligibleGenders.includes('Female')) {
          return false;
        }
      } else if (isMaleQueryActive) {
        if (!s.criteria.eligibleGenders.includes('All') && !s.criteria.eligibleGenders.includes('Male')) {
          return false;
        }
      }

      // 5. Provider Type Filter
      if (filters.providerType !== 'ALL' && s.providerType !== filters.providerType) {
        return false;
      }

      // 6. State / Domicile Filter
      const activeState = parsedNL?.detectedState || (filters.state !== 'ALL' ? filters.state : null);
      if (activeState && activeState !== 'ALL') {
        if (!s.criteria.eligibleStates.includes('ALL') && !s.criteria.eligibleStates.includes(activeState)) {
          return false;
        }
      }

      // 7. Max Income Filter
      const activeMaxIncome = parsedNL?.detectedMaxIncome || (filters.maxIncome > 0 ? filters.maxIncome : null);
      if (activeMaxIncome && s.criteria.maxAnnualIncome !== undefined) {
        if (s.criteria.maxAnnualIncome < activeMaxIncome) {
          return false;
        }
      }

      // 8. Application Status Filter (NL or Explicit)
      if (parsedNL?.detectedStatus && s.deadline.status !== parsedNL.detectedStatus) {
        return false;
      }

      // 9. Academic Marks Filter (NL)
      if (parsedNL?.detectedMinMarks !== undefined && s.criteria.minPercentage !== undefined) {
        if (s.criteria.minPercentage > parsedNL.detectedMinMarks) {
          return false;
        }
      }

      // 10. Course Filter (NL)
      if (parsedNL?.detectedCourse) {
        const cLower = parsedNL.detectedCourse.toLowerCase();
        const courseMatch =
          !s.criteria.eligibleCourses ||
          s.criteria.eligibleCourses.includes('ALL') ||
          s.criteria.eligibleCourses.some(c => c.toLowerCase().includes(cLower));
        if (!courseMatch) return false;
      }

      // 11. Tuition / Fee Assistance Need (NL)
      if (parsedNL?.detectedTuitionNeed) {
        const isTuition =
          s.awardAmount.type === 'full_tuition_and_allowance' ||
          Boolean(s.awardAmount.feeWaiverPercentage && s.awardAmount.feeWaiverPercentage > 0) ||
          s.tags.some(t => t.toLowerCase().includes('tuition') || t.toLowerCase().includes('fee'));
        if (!isTuition && s.awardAmount.maxAmountPerYear < 50000) return false;
      }

      return true;
    });
  }, [searchQuery, parsedNL, filters, isFemaleQueryActive, isMaleQueryActive]);

  // Sort logic (strictly prioritizing female-exclusive for female queries)
  const sortedScholarships = useMemo(() => {
    let list = [...filteredScholarships];

    if (isFemaleQueryActive) {
      list = list.sort((a, b) => {
        const aOnlyFemale = a.criteria.eligibleGenders.length === 1 && a.criteria.eligibleGenders[0] === 'Female';
        const bOnlyFemale = b.criteria.eligibleGenders.length === 1 && b.criteria.eligibleGenders[0] === 'Female';
        if (aOnlyFemale && !bOnlyFemale) return -1;
        if (!aOnlyFemale && bOnlyFemale) return 1;
        return 0;
      });
    }

    if (!profile) return list;

    if (filters.sortBy === 'match') {
      return list.sort((a, b) => {
        const scoreA = evaluateEligibility(a, profile).matchScore;
        const scoreB = evaluateEligibility(b, profile).matchScore;
        return scoreB - scoreA;
      });
    }

    if (filters.sortBy === 'deadline') {
      return list.sort((a, b) => {
        const dateA = a.deadline.closingDate ? new Date(a.deadline.closingDate).getTime() : 9999999999999;
        const dateB = b.deadline.closingDate ? new Date(b.deadline.closingDate).getTime() : 9999999999999;
        return dateA - dateB;
      });
    }

    if (filters.sortBy === 'amount') {
      return list.sort((a, b) => b.awardAmount.maxAmountPerYear - a.awardAmount.maxAmountPerYear);
    }

    if (filters.sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [filteredScholarships, profile, filters.sortBy, isFemaleQueryActive]);

  const handleReset = () => {
    setSearchQuery('');
    setParsedNL(null);
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    filters.level !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.gender !== 'All' ||
    filters.state !== 'ALL' ||
    filters.providerType !== 'ALL' ||
    filters.maxIncome > 0;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Verified Indian Scholarship Catalog
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Discover & Search Scholarships
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Explore over {SCHOLARSHIPS_DATA.length} verified central, state, and corporate CSR schemes. Natural language search extracts stream, category, and income criteria automatically.
          </p>
        </div>

        <SearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          onParsedQueryChange={setParsedNL}
        />
      </div>

      {/* Main Content Layout (Sidebar Filters + Results Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleReset}
          />
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            Showing <span className="font-bold text-slate-900">{sortedScholarships.length}</span> scholarships
          </span>
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filters ({hasActiveFilters ? 'Active' : 'All'})</span>
          </button>
        </div>

        {/* Mobile Filter Sheet */}
        {isFilterDrawerOpen && (
          <div className="lg:hidden col-span-1">
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Informative Notice for "For Boys" Inquiries */}
          {isMaleQueryActive && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-3 shadow-2xs animate-fadeIn">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-bold text-blue-900">Affirmative Action Information Notice: </span>
                <span>
                  There are currently no verified government or corporate scholarships exclusively reserved for male students.
                  Displaying merit, need, and course-based scholarships open to all eligible students (including male applicants).
                </span>
              </div>
            </div>
          )}

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Active:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <span>"{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.level !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                  <span>Level: {filters.level}</span>
                  <button onClick={() => setFilters(f => ({ ...f, level: 'ALL' }))} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.category !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                  <span>Category: {filters.category}</span>
                  <button onClick={() => setFilters(f => ({ ...f, category: 'ALL' }))} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.gender !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                  <span>Gender: {filters.gender}</span>
                  <button onClick={() => setFilters(f => ({ ...f, gender: 'All' }))} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.state !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                  <span>State: {filters.state}</span>
                  <button onClick={() => setFilters(f => ({ ...f, state: 'ALL' }))} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.maxIncome > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                  <span>Income ≤ ₹{filters.maxIncome.toLocaleString('en-IN')}</span>
                  <button onClick={() => setFilters(f => ({ ...f, maxIncome: 0 }))} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleReset}
                className="text-[11px] text-emerald-700 font-bold hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="hidden lg:flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <span className="font-bold text-slate-900">{sortedScholarships.length}</span> verified schemes
            </span>
            <span>Sorted by: {filters.sortBy.toUpperCase()}</span>
          </div>

          {sortedScholarships.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                <SearchX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Scholarships Matched</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  No scholarships matched the exact criteria. Try relaxing your filters below to uncover broader opportunities:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {filters.state !== 'ALL' && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, state: 'ALL' }))}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Clear State Filter ({filters.state})
                  </button>
                )}
                {filters.maxIncome > 0 && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, maxIncome: 0 }))}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Remove Income Limit
                  </button>
                )}
                {filters.level !== 'ALL' && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, level: 'ALL' }))}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    All Education Levels
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedScholarships.slice(0, visibleCount).map(scholarship => {
                  const eligibility = profile
                    ? evaluateEligibility(scholarship, profile)
                    : {
                        scholarshipId: scholarship.id,
                        status: 'conditionally_eligible' as const,
                        matchScore: 80,
                        satisfiedRules: [],
                        failedRules: [],
                        missingInfoRules: [],
                        summaryMessage: 'Sign in or complete profile to evaluate exact criteria.',
                        recommendations: [],
                      };

                  return (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      eligibility={eligibility}
                      onOpenAudit={onOpenAudit}
                    />
                  );
                })}
              </div>

              {visibleCount < sortedScholarships.length && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setVisibleCount(c => c + 12)}
                    className="px-6 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs hover:border-emerald-500"
                  >
                    Load More Scholarships (Showing {Math.min(visibleCount, sortedScholarships.length)} of {sortedScholarships.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
