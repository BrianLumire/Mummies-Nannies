// /components/tablecontrols/TableControlsNanny.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FilterCriteria } from "@/utils/filterData";

interface TableControlsNannyProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: (filter: FilterCriteria) => void;
  onSortClick: (column: string) => void;
  selectedButton: string;
}

const TableControlsNanny: React.FC<TableControlsNannyProps> = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onSortClick,
  selectedButton,
}) => {
  const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setSortDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // For simplicity, assume filtering by location for both tables
  const filterableOptions: { [key: string]: string[] } = {
    "Available Nannies": ["Molo, Nakuru", "Other Location"],
    "Unavailable Nannies": ["Molo, Nakuru", "Other Location"],
  };

  // Sortable columns (a simple selection)
  const sortableColumns: string[] = ["name", "location", "rating"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Search input */}
       <div className="flex items-center border border-gray-300 w-[60%] rounded-lg px-2 py-[6px] gap-2 bg-[#FAFAFA]">
            <Image src="/admin-assets/search-icon.svg" alt="Search" width={10} height={10} />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="outline-none  font-barlow text-xs text-black bg-transparent"
              />
        
      </div>
      {/* Filter dropdown */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setFilterDropdownOpen(!isFilterDropdownOpen)}
          className="p-2 border border-gray-300 rounded-lg bg-[#FAFAFA]"
        >
          <Image src="/admin-assets/filter-icon.svg" alt="Filter" width={12} height={12} />
        </button>
        {isFilterDropdownOpen && (
          <div className="absolute bg-white border border-gray-300 rounded-lg mt-2 py-2 w-36 shadow-lg z-10">
            {filterableOptions[selectedButton]?.map((option) => (
              <div
                key={option}
                onClick={() => {
                  onFilterClick({ location: option });
                  setFilterDropdownOpen(false);
                }}
                className="px-4 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Sort dropdown */}
      <div className="relative" ref={sortRef}>
        <button
          onClick={() => setSortDropdownOpen(!isSortDropdownOpen)}
          className="p-[9px] border border-gray-300 rounded-lg bg-[#FAFAFA]"
        >
          <Image src="/admin-assets/sort-icon.svg" alt="Sort" width={10} height={10} />
        </button>
        {isSortDropdownOpen && (
          <div className="absolute bg-white border border-gray-300 rounded-lg mt-2 py-2 w-36 shadow-lg z-10">
            {sortableColumns.map((column) => (
              <div
                key={column}
                onClick={() => {
                  onSortClick(column);
                  setSortDropdownOpen(false);
                }}
                className="px-4 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer"
              >
                {column}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableControlsNanny;
