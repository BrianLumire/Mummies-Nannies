"use client";
import React, { useState } from "react";
import Image from "next/image";
import TableSingleNanny from "@/components/nannies/TableSingleNanny";
import { renderRowSingleNanny } from "@/components/nannies/renderRowSingleNanny";
import { filterData, FilterCriteria } from "@/utils/filterData";
import { sortData } from "@/utils/sortData";
import {
  Offer,
  acceptedOffers,
  acceptedOffersColumns,
  pendingOffers,
  pendingOffersColumns,
  declinedOffers,
  declinedOffersColumns,
} from "@/utils/nannies/nanniesData";
import { useNanny } from "@/hooks/nanny/useNanniesSingle"; // Correct import

interface Column {
  header: string;
  accessor: string;
}

// Helper functions to map raw values to display strings:
const mapKidsCount = (value: string | null | undefined) => {
  const mapping: Record<string, string> = {
    one_to_two: "1-2 kids",
    one_to_five: "1-5 kids",
    more_than_five: "More than 5 kids",
  };
  return value ? mapping[value] || value : "No preference";
};

const mapAgeGroup = (value: string | null | undefined) => {
  const mapping: Record<string, string> = {
    zero_to_one: "Upto 1 year old",
    one_to_three: "1-3 years old",
    three_and_above: "Over 3 years old",
  };
  return value ? mapping[value] || value : "No preference";
};

const mapNannyServices = (services: string[] | undefined) => {
  return services && services.length > 0 ? services.join(", ") : "N/A";
};

const SingleNannyPage = () => {
  const { nannyData, loading, error } = useNanny();
  const [selectedTab, setSelectedTab] = useState("Profile Information");
  const [selectedOfferTab, setSelectedOfferTab] = useState("Accepted Offers");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [loadingOffers, setLoadingOffers] = useState(false);

  if (loading) return <div className="p-4">Loading nanny data...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;
  if (!nannyData) return <div className="p-4">No nanny data found</div>;

  // Get data for the selected offer tab
  const getTableData = (): { data: Offer[]; columns: Column[] } => {
    switch (selectedOfferTab) {
      case "Accepted Offers":
        return { data: acceptedOffers as Offer[], columns: acceptedOffersColumns };
      case "Pending Offers":
        return { data: pendingOffers as Offer[], columns: pendingOffersColumns };
      case "Declined Offers":
        return { data: declinedOffers as Offer[], columns: declinedOffersColumns };
      default:
        return { data: [], columns: [] };
    }
  };

  const { data, columns } = getTableData();
  const filteredData = filterData(data, searchTerm, filters);
  const sortedData = sortData(filteredData, sortColumn, sortOrder);

  const handleOfferTabClick = (tab: string) => {
    setLoadingOffers(true);
    setSelectedOfferTab(tab);
    setSearchTerm("");
    setSortColumn(null);
    setSortOrder("asc");
    setFilters({});
    setTimeout(() => setLoadingOffers(false), 300);
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

  return (
    <div className="p-4">
      {/* Buttons Section */}
      <div className="bg-[#FAFAFA] p-3 rounded-lg shadow-md border border-gray-200 flex gap-3">
        <button
          onClick={() => setSelectedTab("Profile Information")}
          className={`px-4 py-2 rounded-lg font-barlow text-xs ${
            selectedTab === "Profile Information"
              ? "bg-white text-[#6000DA] shadow-md"
              : "bg-[#FAFAFA] text-black shadow-sm"
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setSelectedTab("Received Offers")}
          className={`px-4 py-2 rounded-lg font-barlow text-xs ${
            selectedTab === "Received Offers"
              ? "bg-white text-[#6000DA] shadow-md"
              : "bg-[#FAFAFA] text-black shadow-sm"
          }`}
        >
          Received Offers
        </button>
      </div>

      {/* Profile Information Section */}
      {selectedTab === "Profile Information" && (
        <div className="flex mt-5 flex-col gap-3">
          {/* Work Preferences */}
          <div>
            <p className="mb-2 font-barlow text-sm font-semibold">
              Work Preferences
            </p>
            <div className="border p-2 border-gray-200 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-4 border-b border-gray-200">
                <span className="font-barlow text-[#787878]">
                  Number of kids preferred
                </span>
                <div className="flex items-center gap-2">
                  <Image
                    src="/nannies-assets/kid-1.svg"
                    alt="kid icon"
                    width={23}
                    height={23}
                  />
                  <span className="font-barlow text-sm">
                    {mapKidsCount(nannyData.preferred_kids_count)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-4 border-b border-gray-200">
                <span className="font-barlow text-[#787878]">
                  Preferred age group
                </span>
                <div className="flex items-center gap-2">
                  <Image
                    src="/nannies-assets/kid-2.svg"
                    alt="kid icon"
                    width={23}
                    height={23}
                  />
                  <span className="font-barlow text-sm">
                    {mapAgeGroup(nannyData.preferred_age_group)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-4">
                <span className="font-barlow text-[#787878]">
                  Available For
                </span>
                <span className="font-barlow text-sm">
                  {mapNannyServices(nannyData.nanny_services)}
                </span>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div>
            <p className="mb-2 font-barlow text-sm font-semibold">
              Qualifications
            </p>
            <div className="border p-2 border-gray-200 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-4 border-b border-gray-200">
                <span className="font-barlow text-[#787878]">Highest Education Level</span>
                <span className="font-barlow font-semibold">
                  {nannyData.education_level || "N/A"}
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-4">
                <span className="font-barlow text-[#787878]">Years of Experience</span>
                <span className="font-barlow font-semibold">
                  {nannyData.years_of_experience !== null
                    ? nannyData.years_of_experience
                    : "N/A"} years
                </span>
              </div>
            </div>
          </div>

          {/* Contact Persons */}
          <div>
            <p className="mb-2 font-barlow text-sm font-semibold">
              Contact Person(s)
            </p>
            <div className="border p-2 border-gray-200 rounded-lg shadow-sm">
              {nannyData.contact_persons && nannyData.contact_persons.length > 0 ? (
                nannyData.contact_persons.map(
                  (contact: { name: string; phone: string; relationship: string }, index: number) => (
                    <div key={index} className="flex flex-col py-4 border-b border-gray-200">
                      <span className="font-barlow mb-3 font-medium">
                        {contact.relationship}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="font-barlow text-sm text-[#787878]">
                          {contact.name}
                        </span>
                        <span className="font-barlow text-sm text-[#787878]">
                          {contact.phone}
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="py-4">No contact persons available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Received Offers Section */}
      {selectedTab === "Received Offers" && (
        <div className="mt-4">
          {/* Offer Tabs */}
          <div className="flex gap-4 mb-5 border-b border-gray-200">
            {["Accepted Offers", "Pending Offers", "Declined Offers"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleOfferTabClick(tab)}
                className={`font-barlow text-sm ${
                  selectedOfferTab === tab
                    ? "text-[#6000DA] decoration-2 pb-[4px] underline underline-offset-8 decoration-[#6000DA]"
                    : "text-[#787878]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table Section */}
          {loadingOffers ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
            </div>
          ) : (
            <TableSingleNanny
              key={selectedOfferTab}
              columns={columns}
              data={sortedData}
              renderRow={(item) => renderRowSingleNanny(item, selectedOfferTab)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onFilterClick={handleFilterClick}
              onSortClick={handleSortClick}
              selectedOfferTab={selectedOfferTab}
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
      )}
    </div>
  );
};

export default SingleNannyPage;
