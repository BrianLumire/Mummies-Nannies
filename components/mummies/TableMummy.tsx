// /components/Mummies/TableMummy.tsx
"use client";
import React from "react";
import TableControlsMummy from "@/components/mummies/TableControlsMummy";
import { FilterCriteria } from "@/utils/filterData";

export interface Mummy {
  id: string;
  name: string;
  photo: string;
  phonenumber: number;
  location?: string;
  budgetrange: string;
  lookingfor: string;
  availablefor?: string;
  pitchednannies: number;
  rating: number;
  ratingphoto: string;
  lastseen?: string;
  suspenionfor?: string;
}

interface Column {
  header: string;
  accessor: string;
}

interface TableMummyProps {
  columns: Column[];
  data: Mummy[];
  renderRow: (item: Mummy) => React.ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: (filter: FilterCriteria) => void;
  onSortClick: (column: string) => void;
  selectedButton: string;
  resetFilters: () => void;
  isAnyFilterApplied: boolean;
}

const TableMummy: React.FC<TableMummyProps> = ({
  columns,
  data,
  renderRow,
  searchTerm,
  onSearchChange,
  onFilterClick,
  onSortClick,
  selectedButton,
  resetFilters,
  isAnyFilterApplied,
}) => {
  return (
    <div className="rounded-lg  border border-gray-200 shadow-lg">
      {/* Table header and controls */}
      <div className="flex  flex-col md:flex-row bg-white gap-2 items-center justify-between  rounded-lg px-3 py-2">
        <p className="font-barlow font-semibold text-sm text-black">
          {selectedButton}
        </p>
        {isAnyFilterApplied && (
          <button
            onClick={resetFilters}
            className="px-4 py-1  text-xs bg-[#6000DA] text-white rounded-lg"
          >
            Clear filters
          </button>
        )}
        <TableControlsMummy
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onFilterClick={onFilterClick}
          onSortClick={onSortClick}
          selectedButton={selectedButton}
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#F5F5F5]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-2 py-[10px] text-left text-[11px] font-semibold font-inter text-black"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => renderRow(item))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center font-inter text-red-500"
                >
                  No results found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableMummy;
