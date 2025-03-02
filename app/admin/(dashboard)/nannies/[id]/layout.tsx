"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useNanny } from "@/hooks/nanny/useNanniesSingle";
import AvailabiltyToggle from "@/components/nannies/AvailabiltyToggle";
import SuspendModel from "@/components/nannies/SuspendModel";
import EditProfileFlow from "@/components/nannies/edit/EditProfileFlow";

export default function SingleMummyLayout({ children }: { children: React.ReactNode; }) {
  const { nannyData, loading, error } = useNanny();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showEditProfileFlow, setShowEditProfileFlow] = useState(false);

  const handleSuspendConfirm = () => {
    console.log("Nanny suspended");
    setShowSuspendModal(false);
  };

  if (loading) return <div className="p-4">Loading nanny data...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;
  if (!nannyData) return <div className="p-4">No data found</div>;

  return (
    <div className="h-full mx-2 mb-4 relative">
      {/* Top Section */}
      <div className="flex items-center mt-3 justify-between mb-5 md:mb-3">
        <div>
          <div className="flex gap-2 items-center mb-1">
            <span className="text-[16px] font-barlow font-semibold">
              {nannyData.user_accounts?.full_name || "Unknown"}
            </span>
            <div className="rounded-lg py-[3px] flex items-center justify-center px-3 shadow-lg shadow-[#6000DA26] text-[9px] bg-[#6000DA26] text-[#6000DA]">
              {nannyData.is_available ? "Available" : "Unavailable"}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-barlow">
              <span className="text-[#6000DA]">Home / Nannies</span> / {nannyData.user_accounts?.full_name || "Unknown"}
            </span>
          </div>
        </div>
        {/* Manage button with dropdown */}
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
              {/* Dropdown Item 1: Availability On */}
              <div className="p-2 border-b flex items-center gap-3">
                <Image src="/nannies-assets/status.svg" width={22} height={22} alt="Status Icon" />
                <span className="text-sm font-barlow">Availability On</span>
                <AvailabiltyToggle
  nannyId={nannyData.id}
  currentAvailability={nannyData.is_available}
/>

              </div>
              {/* Dropdown Item 2: Suspend */}
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
              {/* Dropdown Item 3: Edit Profile */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setShowEditProfileFlow(true);
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
      {showSuspendModal && (
  <SuspendModel
    nannyId={nannyData.id}
    onClose={() => setShowSuspendModal(false)}
    onConfirm={handleSuspendConfirm}
  />
)}
     {showEditProfileFlow && (
  <EditProfileFlow nannyId={nannyData.id} onClose={() => setShowEditProfileFlow(false)} />
)}


      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row gap-2 w-full h-full">
        {/* Sidebar */}
        <div className="border rounded-lg h-full shadow-md md:w-1/5">
          {/* Profile Container */}
          <div className="h-1/4 relative">
            <Image
              src={nannyData.user_accounts?.avatar_url || "/nannies-assets/single-profile.svg"}
              width={100}
              height={100}
              alt="Profile"
              className="object-cover rounded-lg w-full h-full"
            />
          </div>
          {/* Details */}
          <div className="h-3/4 p-2 flex flex-col border-t bg-[#FAFAFA]">
            <div className="flex flex-col border-b items-center justify-center gap-2 py-2">
              <p className="font-barlow text-base font-medium">
                {nannyData.user_accounts?.full_name || "Unknown"}
              </p>
              <div className="flex items-center gap-2">
                <Image src="/nannies-assets/single-location.svg" width={15} height={15} alt="Location" />
                <span className="font-barlow text-xs">
                  {nannyData.location || "No location"}
                </span>
                <Image src="/nannies-assets/single-rating.svg" width={15} height={15} alt="Rating" />
                <span className="font-barlow text-xs">
                  {nannyData.rating || "4.5"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-work.svg" width={17} height={17} alt="Work Terms" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Work Terms</span>
                <span className="font-barlow font-semibold text-xs">
                  {nannyData.work_type || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-phone.svg" width={17} height={17} alt="Phone" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Phone No</span>
                <span className="font-barlow font-semibold text-xs">
                  {nannyData.user_accounts?.phone ? `+254 ${nannyData.user_accounts.phone}` : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-religion.svg" width={17} height={17} alt="Religion" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Religion</span>
                <span className="font-barlow font-semibold text-xs">
                  {nannyData.religion || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-tribe.svg" width={17} height={17} alt="Tribe" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Tribe</span>
                <span className="font-barlow font-semibold text-xs">
                  {nannyData.tribe || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-nation.svg" width={17} height={17} alt="Nationality" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Nationality</span>
                <span className="font-barlow font-semibold text-xs">
                  {nannyData.nationality || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-b">
              <Image src="/nannies-assets/single-salary.svg" width={17} height={17} alt="Salary" />
              <div className="flex flex-col gap-1">
                <span className="font-barlow text-xs text-gray-500">Salary Range</span>
                <span className="font-barlow font-semibold text-xs">
                  {nannyData.salary_ranges?.label || "N/A"}
                </span>
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
