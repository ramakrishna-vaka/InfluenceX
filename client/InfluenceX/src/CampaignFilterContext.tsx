import React, { createContext, useContext, useState,useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface FilterState {
  status: string;
  category: string;
  budget: string;
}

interface CampaignFilterContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearAllFilters: () => void;
}

const CampaignFilterContext = createContext<CampaignFilterContextType | undefined>(undefined);

export const CampaignFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    category: 'all',
    budget: 'all'
  });

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      budget: 'all'
    });
    setSortBy('recent');
    setSearchQuery('');
    };

  return (
    <CampaignFilterContext.Provider value={{
      searchQuery,
      setSearchQuery,
      sortBy,
      setSortBy,
      filters,
      setFilters,
      clearAllFilters
    }}>
      {children}
    </CampaignFilterContext.Provider>
  );
};

export const useCampaignFilter = () => {
  const context = useContext(CampaignFilterContext);
  if (!context) {
    throw new Error('useCampaignFilter must be used within CampaignFilterProvider');
  }
  return context;
};