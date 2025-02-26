"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NannyData } from "@/hooks/nanny/useNannies";

export const renderRowNanny = (
  item: NannyData,
  selectedButton: string,
  router: ReturnType<typeof useRouter>
) => {
  if (selectedButton === "Available Nannies") {
    return (
      <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
        {/* Name */}
        <td className="px-3 py-3 text-xs max-w-[90px] font-inter whitespace-nowrap sm:whitespace-normal">
          <button className="flex items-center gap-3" onClick={() => router.push(`/admin/nannies/${item.id}`)}>
            <Image src={item.avatar_url} alt={`${item.full_name}'s photo`} width={40} height={40} className="rounded-full" />
            <span className="text-xs font-inter">{item.full_name}</span>
          </button>
        </td>
        {/* Phone */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
          {item.phone}
        </td>
        {/* Location */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
          {item.location ?? "N/A"}
        </td>
        {/* Budget Range */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
          {item.budget_range}
        </td>
        {/* Available For */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
        <div className="px-2 py-1 text-xs font-inter border border-black bg-white rounded-lg">
          {item.availablefor}
          </div>
        </td>
        {/* Work Type */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
          {item.work_type ?? "N/A"}
        </td>
        {/* Rating */}
        <td className="px-3 py-3 whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-2">
            <Image src="/admin-assets/rating icon.svg" alt="Rating" width={18} height={18} />
            <span className="text-xs font-inter">{item.rating !== null ? item.rating : "N/A"}</span>
          </div>
        </td>
        {/* Offers */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
          {item.offers}
        </td>
      </tr>
    );
  } else if (selectedButton === "Unavailable Nannies") {
    return (
      <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
        {/* Name */}
        <td className="px-3 py-3 text-xs  font-inter whitespace-nowrap sm:whitespace-normal">
          <button className="flex items-center gap-3" onClick={() => router.push(`/admin/nannies/${item.id}`)}>
            <Image src={item.avatar_url} alt={`${item.full_name}'s photo`} width={40} height={40} className="rounded-full" />
            <span className="text-xs font-inter">{item.full_name}</span>
          </button>
        </td>
        {/* Phone */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.phone}
        </td>
        {/* Location */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.location ?? "N/A"}
        </td>
        {/* Budget Range */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.budget_range}
        </td>
        {/* Available For */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          <div className="px-2 py-1 text-xs font-inter border border-black bg-white rounded-lg">
          {item.availablefor}
          </div>
        </td>
        {/* Work Type */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.work_type ?? "N/A"}
        </td>
        {/* Rating */}
        <td className="px-3 py-3 whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-2">
            <Image src="/admin-assets/rating icon.svg" alt="Rating" width={18} height={18} />
            <span className="text-xs font-inter">{item.rating !== null ? item.rating : "N/A"}</span>
          </div>
        </td>
        {/* Last Seen */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.last_seen}
        </td>
        {/* Reason */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.reason}
        </td>
        {/* Offers */}
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          {item.offers}
        </td>
      </tr>
    );
  }
  return null;
};
