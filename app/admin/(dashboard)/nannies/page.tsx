"use client";
import React, { useState } from "react";
import Image from "next/image";
import MainCards from "@/components/shared/MainCards";
import NannyTable from "@/components/nannies/TableNanny";
import { renderRowNanny } from "@/components/nannies/renderRowNanny";
import { filterData, FilterCriteria } from "@/utils/filterData";
import { sortData } from "@/utils/sortData";
import { useRouter } from "next/navigation";
import { useNannies, NannyData } from "@/hooks/nanny/useNannies";

// Define the Column interface locally
interface Column {
  header: string;
  accessor: keyof NannyData;
}

const NanniesPage = () => {
  const [selectedButton, setSelectedButton] = useState("Available Nannies");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [loadingSim, setLoadingSim] = useState(false);
  const router = useRouter();

  const buttons = ["Available Nannies", "Unavailable Nannies"];

  const handleAddNannyClick = () => {
    router.push("/admin/add-nanny");
};

  // Define columns for each view
  const availableColumns: Column[] = [
    { header: "Name", accessor: "full_name" },
    { header: "Phone", accessor: "phone" },
    { header: "Location", accessor: "location" },
    { header: "Budget Range", accessor: "budget_range" },
    { header: "Available For", accessor: "availablefor" },
    { header: "Work Type", accessor: "work_type" },
    { header: "Rating", accessor: "rating" },
    { header: "Offers", accessor: "offers" },
  ];

  const unavailableColumns: Column[] = [
    { header: "Name", accessor: "full_name" },
    { header: "Phone", accessor: "phone" },
    { header: "Location", accessor: "location" },
    { header: "Budget Range", accessor: "budget_range" },
    { header: "Available For", accessor: "availablefor" },
    { header: "Work Type", accessor: "work_type" },
    { header: "Rating", accessor: "rating" },
    { header: "Last Seen", accessor: "last_seen" },
    { header: "Reason", accessor: "reason" },
    { header: "Offers", accessor: "offers" },
  ];

  // Use our custom hook:
  const currentAvailability = selectedButton === "Available Nannies" ? "available" : "unavailable";
  const { data: fetchedNannies, loading, error } = useNannies(currentAvailability);

  // Apply filters and sorting on the fetched data.
  const filteredData = filterData(fetchedNannies, searchTerm, filters);
  const sortedData = sortData(filteredData, sortColumn, sortOrder);

  const handleButtonClick = (button: string) => {
    setLoadingSim(true);
    setSelectedButton(button);
    // Reset filters, search, and sort when switching tables
    setSearchTerm("");
    setSortColumn(null);
    setSortOrder("asc");
    setFilters({});
    // Simulate a loading delay
    setTimeout(() => setLoadingSim(false), 300);
  };

  const handleSortClick = (column: string) => {
    const order = sortColumn === column && sortOrder === "desc" ? "asc" : "desc";
    setSortColumn(column);
    setSortOrder(order);
  };

  const handleFilterClick = (filter: FilterCriteria) => {
    setFilters(filter);
  };

  const isAnyFilterApplied = Boolean(
    searchTerm || sortColumn || Object.keys(filters).length > 0
  );

  // Choose columns based on selected button
  const columns = selectedButton === "Available Nannies" ? availableColumns : unavailableColumns;

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold">Manage Nannies</span>
          <span className="text-sm">
            <span style={{ color: "#6000DA" }}>Home</span> / Nannies
          </span>
        </div>
        <div>
        <button 
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-700"
                        onClick={handleAddNannyClick} // Add the onClick handler
                    >
                        <Image src="/admin-assets/add-icon.svg" alt="Add Nanny" width={13} height={13} />
                        <span className="text-white text-sm">Add Nanny</span>
                    </button>
        </div>
      </div>

      {/* Overview Cards Section */}
      <div className="bg-gray-50 p-3 mt-4 shadow-md rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="mb-3 font-semibold text-sm">Overview</h1>
          <button className="flex items-center gap-3 bg-white rounded-lg px-4 py-1">
            <span className="text-xs">February</span>
            <Image src="/admin-assets/dropdown.svg" alt="Dropdown" width={13} height={13} />
          </button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between mb-4">
          <MainCards
            imageSrc="/admin-assets/onboard.svg"
            imageAlt="Onboard Icon"
            imageBgColor="#6000DA12"
            primaryText="23"
            secondaryText="Nannies Onboarded"
          />
          <MainCards
            imageSrc="/admin-assets/document.svg"
            imageAlt="Document Icon"
            imageBgColor="#6000DA12"
            primaryText="20"
            secondaryText="Hired Nannies"
          />
          <MainCards
            imageSrc="/admin-assets/available-icon.svg"
            imageAlt="Available Icon"
            imageBgColor="#6000DA12"
            primaryText="23"
            secondaryText="Available Nannies"
          />
          <MainCards
            imageSrc="/admin-assets/unavailable.svg"
            imageAlt="Unavailable Icon"
            imageBgColor="#6000DA12"
            primaryText="15"
            secondaryText="Unavailable Nannies"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-4">
        <h1 className="font-semibold text-base">All Nannies</h1>
        <div className="my-4">
          <div className="flex gap-3 bg-[#FAFAFA] p-3 rounded-lg shadow-md border border-gray-200">
            {buttons.map((button) => (
              <button
                key={button}
                onClick={() => handleButtonClick(button)}
                className={`px-4 py-2 rounded-lg font-barlow text-xs ${
                  selectedButton === button
                    ? "bg-white text-[#6000DA] shadow-md"
                    : "bg-[#FAFAFA] text-black shadow-sm"
                }`}
              >
                {button}
              </button>
            ))}
          </div>
        </div>
        {loading || loadingSim ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <NannyTable
            key={selectedButton}
            columns={columns}
            data={sortedData}
            renderRow={(item) => renderRowNanny(item, selectedButton, router)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={handleFilterClick}
            onSortClick={handleSortClick}
            selectedButton={selectedButton}
            resetFilters={() => {
              setSearchTerm("");
              setSortColumn(null);
              setSortOrder("asc");
              setFilters({});
            }}
            isAnyFilterApplied={isAnyFilterApplied}
          />
        )}
      </div>
    </div>
  );
};

export default NanniesPage;
