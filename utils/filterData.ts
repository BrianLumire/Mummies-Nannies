// /utils/filterData.ts

export interface FilterCriteria {
    [key: string]: string;
  }
  
  export const filterData = <T extends Record<string, any>>(
    data: T[],
    searchTerm: string,
    filters: FilterCriteria
  ): T[] => {
    return data.filter(item => {
      const matchesSearch = Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesFilters = Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        return String(item[key]).toLowerCase().includes(filters[key].toLowerCase());
      });
      return matchesSearch && matchesFilters;
    });
  };
  