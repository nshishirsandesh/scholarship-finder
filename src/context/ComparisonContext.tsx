import React, { createContext, useContext, useState } from 'react';

interface ComparisonContextType {
  selectedIds: string[];
  isComparing: boolean;
  toggleCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isCompared: (id: string) => boolean;
  openComparisonModal: () => void;
  closeComparisonModal: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleCompare = (id: string): boolean => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
      return false;
    }
    if (selectedIds.length >= 4) {
      alert('You can compare a maximum of 4 scholarships simultaneously.');
      return false;
    }
    setSelectedIds(prev => [...prev, id]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setSelectedIds(prev => prev.filter(item => item !== id));
  };

  const clearCompare = () => {
    setSelectedIds([]);
    setIsComparing(false);
  };

  const isCompared = (id: string) => selectedIds.includes(id);

  const openComparisonModal = () => setIsComparing(true);
  const closeComparisonModal = () => setIsComparing(false);

  return (
    <ComparisonContext.Provider
      value={{
        selectedIds,
        isComparing,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isCompared,
        openComparisonModal,
        closeComparisonModal,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
