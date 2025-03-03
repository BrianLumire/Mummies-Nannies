"use client"; 
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MainCards from "@/components/shared/MainCards";
import TableMummy from "@/components/mummies/TableMummy";
import { renderRowMummy } from "@/components/mummies/renderRowMummy";
import { filterData, FilterCriteria } from "@/utils/filterData";
import { sortData } from "@/utils/sortData";
import AddMummyFlow from "@/components/mummies/add-mummy/AddMummyFlow";
import { createClient } from "@/supabase/client";

// Define the Mummy interface used by the UI.
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
  is_suspended?: boolean;
}

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
};

// Define an interface for the fetched record from Supabase.
interface MammiesRecord {
  id: string;
  location: string | null;
  nanny_services: ("special_needs" | "elderly" | "childcare")[] | null;
  is_suspended: boolean;
  mammy_suspension_reason_id: string | null;
  user_accounts: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
  } | null;
  salary_ranges: {
    label: string;
  } | null;
  mammy_suspension_reasons: {
    label: string;
  } | null;
}

const MummiesPage = () => {
  const [selectedButton, setSelectedButton] = useState("Active Mummies");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [loading, setLoading] = useState(false);
  const [activeMummies, setActiveMummies] = useState<Mummy[]>([]);
  const [suspendedMummies, setSuspendedMummies] = useState<Mummy[]>([]);
  const [showAddMummyFlow, setShowAddMummyFlow] = useState(false);
  const router = useRouter();
  const buttons = ["Active Mummies", "Suspended Mummies"];

  // Fetch data from Supabase by joining mammies, user_accounts, salary_ranges, and mammy_suspension_reasons.
  useEffect(() => {
    const fetchMummies = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("mammies")
        .select(`
          id,
          location,
          nanny_services,
          is_suspended,
          mammy_suspension_reason_id,
          user_accounts (
            full_name,
            phone,
            avatar_url,
            created_at
          ),
          salary_ranges (
            label
          ),
          mammy_suspension_reasons (
            label
          )
        `);
      if (error) {
        console.error("Error fetching mummies:", error);
        setLoading(false);
        return;
      }
      if (data) {
        // Map returned data into Mummy objects.
        const mummies: Mummy[] = data.map((record: MammiesRecord) => {
          return {
            id: record.id,
            // From user_accounts:
            name: record.user_accounts?.full_name || "Unknown",
            photo: record.user_accounts?.avatar_url || "/admin-assets/profile1.svg",
            phonenumber: record.user_accounts?.phone ? Number(record.user_accounts.phone) : 0,
            lastseen: record.user_accounts?.created_at
              ? formatDate(record.user_accounts.created_at)
              : "N/A",
            // From mammies:
            location: record.location || "N/A",
            lookingfor: Array.isArray(record.nanny_services)
              ? record.nanny_services.join(", ")
              : "N/A",
            budgetrange: record.salary_ranges?.label || "N/A",
            availablefor: "N/A",
            pitchednannies: 0,
            rating: 0,
            ratingphoto: "/admin-assets/rating-icon.svg",
            // Get suspension reason from the joined mammy_suspension_reasons table.
            suspenionfor: record.mammy_suspension_reasons?.label || "N/A",
            is_suspended: record.is_suspended,
          };
        });
        setActiveMummies(mummies.filter((m) => !m.is_suspended));
        setSuspendedMummies(mummies.filter((m) => m.is_suspended));
      }
      setLoading(false);
    };

    fetchMummies();
  }, []);

  const getTableData = () => {
    if (selectedButton === "Active Mummies") {
      return {
        data: activeMummies,
        columns: [
          { header: "Name", accessor: "name" },
          { header: "Phone", accessor: "phonenumber" },
          { header: "Location", accessor: "location" },
          { header: "Looking For", accessor: "lookingfor" },
          { header: "Rating", accessor: "rating" },
          { header: "Budget", accessor: "budgetrange" },
          { header: "Pitched Nannies", accessor: "pitchednannies" },
        ],
      };
    } else if (selectedButton === "Suspended Mummies") {
      return {
        data: suspendedMummies,
        columns: [
          { header: "Name", accessor: "name" },
          { header: "Phone", accessor: "phonenumber" },
          { header: "Looking For", accessor: "lookingfor" },
          { header: "Rating", accessor: "rating" },
          { header: "Budget", accessor: "budgetrange" },
          { header: "Last Seen", accessor: "lastseen" },
          { header: "Suspended For", accessor: "suspenionfor" },
        ],
      };
    }
    return { data: [], columns: [] };
  };

  const { data, columns } = getTableData();
  const filteredData = filterData(data, searchTerm, filters);
  const sortedData = sortData(filteredData, sortColumn, sortOrder);

  const handleButtonClick = (button: string) => {
    setLoading(true);
    setSelectedButton(button);
    // Reset filters, search, sort
    setSearchTerm("");
    setSortColumn(null);
    setSortOrder("asc");
    setFilters({});
    setTimeout(() => setLoading(false), 300);
  };

  const handleSortClick = (column: string) => {
    const order = sortColumn === column && sortOrder === "desc" ? "asc" : "desc";
    setSortColumn(column);
    setSortOrder(order);
  };

  const handleFilterClick = (filter: FilterCriteria) => {
    setFilters(filter);
  };

  const isAnyFilterApplied = Boolean(searchTerm || sortColumn || Object.keys(filters).length > 0);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold">Manage Mummies</span>
          <span className="text-sm">
            <span style={{ color: "#6000DA" }}>Home</span> / Mummies
          </span>
        </div>
        <div>
          <button
            onClick={() => {
              // Clear any stored mummyUserId and onboarding step to start a fresh session
              localStorage.removeItem("mummyUserId");
              sessionStorage.removeItem("mummyOnboardingStep"); // CLEAR THE SESSION STORAGE
              setShowAddMummyFlow(true);
            }}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-700"
          >
            <Image src="/admin-assets/add-icon.svg" alt="Add Mummy" width={13} height={13} />
            <span className="text-white text-sm">Add Mummy</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="bg-gray-50 p-3 mt-4 shadow-md rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="mb-3 font-semibold text-sm">Overview</h1>
          <button className="flex items-center gap-3 bg-white rounded-lg px-4 py-1">
            <span className="text-xs">January</span>
            <Image src="/admin-assets/dropdown.svg" alt="Dropdown" width={13} height={13} />
          </button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between mb-4">
          <MainCards
            imageSrc="/admin-assets/onboard.svg"
            imageAlt="Onboard Icon"
            imageBgColor="#6000DA12"
            primaryText="23"
            secondaryText="Registered Mummies"
          />
          <MainCards
            imageSrc="/admin-assets/document.svg"
            imageAlt="Document Icon"
            imageBgColor="#6000DA12"
            primaryText="20"
            secondaryText="Successfully Hired"
          />
          <MainCards
            imageSrc="/admin-assets/available-icon.svg"
            imageAlt="Active Icon"
            imageBgColor="#6000DA12"
            primaryText="23"
            secondaryText="Active Mummies"
          />
          <MainCards
            imageSrc="/admin-assets/unavailable.svg"
            imageAlt="Suspended Icon"
            imageBgColor="#6000DA12"
            primaryText="15"
            secondaryText="Suspended Mummies"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-4">
        <h1 className="font-semibold text-base">All Mummies</h1>
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <TableMummy
            key={selectedButton}
            columns={columns}
            data={sortedData}
            renderRow={(item) => renderRowMummy(item, selectedButton, router)}
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

      {showAddMummyFlow && (
        <AddMummyFlow onClose={() => setShowAddMummyFlow(false)} />
      )}
    </div>
  );
};

export default MummiesPage;
