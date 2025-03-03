"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mummy } from "@/components/mummies/TableMummy";

export const renderRowMummy = (
  item: Mummy,
  selectedButton: string,
  router: ReturnType<typeof useRouter>
) => {
  // Check if item.photo is a valid URL.
  const displayPhoto =
    item.photo && item.photo !== "{}" ? item.photo : "/default-avatar.png";

  const displayName = item.name || "Unknown";
  const displayPhone = item.phonenumber ? item.phonenumber.toString() : "N/A";
  const displayBudget = item.budgetrange || "N/A";

  // Render lookingFor items as badges with a border.
  const renderLookingFor = (lookingFor: string) => {
    if (!lookingFor) return "N/A";
    // Assuming lookingFor is a comma-separated string:
    return (
      <div className="flex flex-wrap gap-2">
        {lookingFor.split(",").map((service, index) => (
          <div
            key={index}
            className="border border-black rounded-lg px-2 py-1 text-xs"
          >
            {service.trim()}
          </div>
        ))}
      </div>
    );
  };

  if (selectedButton === "Active Mummies") {
    return (
      <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 whitespace-nowrap sm:whitespace-normal">
          <button
            className="flex items-center gap-2"
            onClick={() => router.push(`/admin/mummies/${item.id}`)}
          >
            <Image
              src={displayPhoto}
              alt={`${displayName}'s photo`}
              width={33}
              height={33}
              className="rounded-full"
            />
            <span className="text-xs font-inter">{displayName}</span>
          </button>
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {displayPhone}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.location || "N/A"}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {renderLookingFor(item.lookingfor)}
        </td>
        <td className="px-3 py-3 whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-1">
            <Image
              src={item.ratingphoto || "/admin-assets/rating-icon.svg"}
              alt="Rating"
              width={18}
              height={18}
            />
            <span className="text-xs font-inter">{item.rating || 0}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {displayBudget}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.pitchednannies || 0}
        </td>
      </tr>
    );
  } else if (selectedButton === "Suspended Mummies") {
    return (
      <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          <button
            className="flex items-center gap-2"
            onClick={() => router.push(`/admin/mummies/${item.id}`)}
          >
            <Image
              src={displayPhoto}
              alt={`${displayName}'s photo`}
              width={33}
              height={33}
              className="rounded-full"
            />
            <span className="text-xs font-inter">{displayName}</span>
          </button>
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {displayPhone}
        </td>
        <td className="px-3 py-3 text-xs font-intermin-w-[140px] whitespace-nowrap sm:whitespace-normal">
          {renderLookingFor(item.lookingfor)}
        </td>
        <td className="px-3 py-3 whitespace-nowrap sm:whitespace-normal min-w-[100px]">
          <div className="flex items-center gap-1">
            <Image
              src={item.ratingphoto || "/admin-assets/rating-icon.svg"}
              alt="Rating"
              width={18}
              height={18}
            />
            <span className="text-xs font-inter">{item.rating || 0}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {displayBudget}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.lastseen || "N/A"}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.suspenionfor || "N/A"}
        </td>
      </tr>
    );
  }
  return null;
};
