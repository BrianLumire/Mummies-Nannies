"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import EditMummyFlow from "@/components/mummies/edit/EditMummyFlow";
import SuspendMummyModal from "@/components/mummies/SuspendMummyModal";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

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

// Define a type for the fetched mummy data.
interface MummyData {
  id: string;
  location?: string | null;
  is_suspended?: boolean;
  user_accounts: {
    full_name: string | null;
    phone: string | null; // Adjust type if you prefer a number (see below)
    avatar_url: string | null;
    created_at: string;
  } | null;
  nanny_services?: string[] | null;
 // or adjust the type if needed
  salary_ranges?: {
    label: string;
  } | null;
}



// Helper to sanitize URLs for Next/Image.
function sanitizeUrl(url: string): string {
  if (url.startsWith("/") || url.startsWith("http")) {
    return url;
  }
  return "/" + url;
}

// Format created_at timestamp to a friendly format.
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

export default function SingleMummyLayout({ children }: { children: React.ReactNode }) {
  const { id: mummyId } = useParams();
  const id = typeof mummyId === "string" ? mummyId : Array.isArray(mummyId) ? mummyId[0] : undefined;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showEditMummyFlow, setShowEditMummyFlow] = useState(false);
  const [mummyData, setMummyData] = useState<MummyData | null>(null);

  const supabase = createClient();

  // Fetch mummy data by joining mammies, user_accounts, and salary_ranges.
  useEffect(() => {
    async function fetchMummyData() {
      if (!id) return;
      const { data, error } = await supabase
        .from("mammies")
        .select(`
          *,
          user_accounts (
            full_name,
            phone,
            avatar_url,
            created_at
          ),
          salary_ranges (
            label
          )
        `)
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching mummy data:", error.message || error);
        toast.error("Failed to fetch mummy data.");
        return;
      }
      if (data) {
        const sanitizedData = {
          ...data,
          location: data.location ?? undefined,
        };
        setMummyData(sanitizedData);
      }
      
    }
    fetchMummyData();
  }, [id, supabase]);

  // Extract fields with fallbacks.
  const fullName = mummyData?.user_accounts?.full_name || "Unknown";
  const rawAvatarUrl =
    typeof mummyData?.user_accounts?.avatar_url === "string" &&
    mummyData.user_accounts.avatar_url.trim() !== ""
      ? mummyData.user_accounts.avatar_url
      : "/default-avatar.png";
  const avatarUrl = sanitizeUrl(rawAvatarUrl);
  const phone = mummyData?.user_accounts?.phone || "N/A";
  const location = mummyData?.location || "No location";
  // Use nanny_services as "Looking For" (join if it's an array).
  const lookingFor = Array.isArray(mummyData?.nanny_services)
    ? mummyData.nanny_services.join(", ")
    : "N/A";
  const budgetRange = mummyData?.salary_ranges?.label || "N/A";
  const isSuspended = mummyData?.is_suspended;

  // If needed later, you can use this variable. Otherwise, remove it.
  // const lastseen = mummyData?.user_accounts?.created_at 
  //   ? formatDate(mummyData.user_accounts.created_at)
  //   : "N/A";

  // Suspend logic: update the mammies record using the mammies id.
  const handleSuspend = async (reasonId: string) => {
    const { error } = await supabase
      .from("mammies")
      .update({
        is_suspended: true,
        mammy_suspension_reason_id: reasonId,
      })
      .eq("id", id!);
    if (error) {
      console.error("Error suspending mammy:", error.message || error);
      toast.error("Failed to suspend mammy.");
    } else {
      toast.success("Mammy suspended successfully.");
      // Optionally refresh mummy data or perform further actions.
    }
  };

  return (
    <div className="h-full mx-2 mb-4 relative">
      {/* Top Section */}
      <div className="flex items-center mt-3 justify-between mb-5 md:mb-3">
        <div>
          <div className="flex gap-2 items-center mb-1">
            <span className="text-[16px] font-barlow font-semibold">{fullName}</span>
            <div
              className={`rounded-lg py-[3px] flex items-center justify-center px-3 shadow-lg ${
                isSuspended ? "bg-gray-300 text-gray-600" : "bg-[#6000DA26] text-[#6000DA]"
              } text-[9px]`}
            >
              {isSuspended ? "Suspended" : "Active"}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-barlow">
              <span style={{ color: "#6000DA" }}>Home / Mummies</span> / {fullName}
            </span>
          </div>
        </div>
        {/* Manage Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="rounded-lg bg-[#6000DA26] px-2 py-2 flex items-center gap-2"
          >
            <Image src="/nannies-assets/single-settings.svg" width={17} height={17} alt="Settings" />
            <span className="font-barlow text-[#6000DA] font-semibold text-xs">Manage</span>
            <Image src="/nannies-assets/single-drop.svg" width={15} height={15} alt="Dropdown" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
              {/* Dropdown Item: Suspend */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setShowSuspendModal(true);
                }}
                className="p-2 border-b flex items-center gap-3 w-full text-left"
              >
                <Image src="/nannies-assets/suspend.svg" width={22} height={22} alt="Suspend Icon" />
                <span className="text-sm font-barlow">Suspend</span>
              </button>
              {/* Dropdown Item: Edit Profile */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setShowEditMummyFlow(true);
                }}
                className="p-2 flex items-center gap-3 w-full text-left"
              >
                <Image src="/nannies-assets/edit3.svg" width={22} height={22} alt="Edit Icon" />
                <span className="text-sm font-barlow">Edit Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSuspendModal && id && (
        <SuspendMummyModal
          mummyId={id} // Pass the mammies id directly from useParams
          onClose={() => setShowSuspendModal(false)}
          onConfirm={(reasonId: string) => {
            handleSuspend(reasonId);
            setShowSuspendModal(false);
          }}
        />
      )}
      {showEditMummyFlow && id && (
        <EditMummyFlow
          onClose={() => setShowEditMummyFlow(false)}
          mammiesId={id}
        />
      )}

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row gap-2 w-full h-full">
        {/* Sidebar */}
        <div className="border rounded-lg h-full shadow-md md:w-1/5">
          {/* Profile Container */}
          <div className="h-1/4 relative">
            <Image
              src={avatarUrl}
              width={100}
              height={100}
              alt="Profile"
              className="object-cover rounded-lg w-full h-full"
            />
          </div>
          {/* Details */}
          <div className="h-3/4 p-2 flex flex-col border-t bg-[#FAFAFA]">
            <div className="flex flex-col border-b items-center justify-center gap-2 py-2">
              <p className="font-barlow text-base font-medium">{fullName}</p>
              <div className="flex items-center gap-2">
                <Image src="/nannies-assets/single-location.svg" width={15} height={15} alt="Location" />
                <span className="font-barlow text-xs">{location}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-work.svg" width={17} height={17} alt="Work Terms" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Looking For</span>
                <span className="font-barlow font-semibold text-xs">{lookingFor}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-phone.svg" width={17} height={17} alt="Phone" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Phone No</span>
                <span className="font-barlow font-semibold text-xs">{phone ? `+254 ${phone}` : ""}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-salary.svg" width={17} height={17} alt="Budget Range" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Budget Range</span>
                <span className="font-barlow font-semibold text-xs">{budgetRange}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="md:w-4/5">{children}</div>
      </div>
    </div>
  );
}
