"use client";
import React from "react";
import TableControlsSingleNanny from "@/components/nannies/TableControlsSingleNanny";
import { FilterCriteria } from "@/utils/filterData";
import { Offer } from "@/utils/nannies/nanniesData";

interface Column {
  header: string;
  accessor: string;
}

interface OffersTableProps {
  data: Offer[];
  columns: Column[];
  renderRow: (offer: Offer) => React.ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: (filter: FilterCriteria) => void;
  onSortClick: (column: string) => void;
  resetFilters: () => void;
  isAnyFilterApplied: boolean;
  selectedOfferTab: string;
}

const OffersTable: React.FC<OffersTableProps> = ({
  data,
  columns,
  renderRow,
  searchTerm,
  onSearchChange,
  onFilterClick,
  onSortClick,
  resetFilters,
  isAnyFilterApplied,
  selectedOfferTab,
}) => {
  return (
    <div className="rounded-lg bg-white border border-gray-200 shadow-lg">
      {/* Header & Controls */}
      <div className="flex  flex-col md:flex-row bg-white gap-2 items-center justify-between  rounded-lg px-3 py-2">
        <p className="font-barlow font-semibold text-sm text-black">{selectedOfferTab}</p>
        {isAnyFilterApplied && (
          <button
            onClick={resetFilters}
             className="px-4 py-1  text-xs bg-[#6000DA] text-white rounded-lg"
          >
            Clear filters
          </button>
        )}
        <TableControlsSingleNanny
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onFilterClick={onFilterClick}
          onSortClick={onSortClick}
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[930px]">
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
              data.map((offer) => renderRow(offer))
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

export default OffersTable;
