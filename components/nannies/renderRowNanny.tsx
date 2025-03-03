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
  // Render badges for nanny_services
  const renderAvailableForBadges = (services: string) => {
    const serviceArray =
      services && services !== "N/A"
        ? services.split(",").map((s) => s.trim())
        : [];
    if (serviceArray.length === 0) return <span>N/A</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {serviceArray.map((service, index) => (
          <div
            key={index}
            className="px-2 py-1 text-xs font-inter border border-black bg-white rounded-lg"
          >
            {service}
          </div>
        ))}
      </div>
    );
  };

  // Format phone number with +254 prefix if missing
  const formatPhone = (phone: string) => {
    if (!phone) return "N/A";
    return phone.startsWith("+254") ? phone : `+254${phone}`;
  };

  const handleRowClick = () => {
    router.push(`/admin/nannies/${item.id}`);
  };

  return (
    <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
      <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
        <button className="flex items-center gap-3" onClick={handleRowClick}>
          <Image
            src={item.avatar_url}
            alt={`${item.full_name}'s photo`}
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xs font-inter">{item.full_name}</span>
        </button>
      </td>
      <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
        {formatPhone(item.phone)}
      </td>
      <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
        {item.location}
      </td>
      <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
        {item.budget_range}
      </td>
      <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
        {renderAvailableForBadges(item.availablefor)}
      </td>
      <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
        {item.work_type || "N/A"}
      </td>
      <td className="px-3 py-3 whitespace-nowrap sm:whitespace-normal">
        <div className="flex items-center gap-2">
          <Image
            src="/admin-assets/rating-icon.svg"
            alt="Rating"
            width={18}
            height={18}
          />
          <span className="text-xs font-inter">
            {item.rating !== null ? item.rating : "N/A"}
          </span>
        </div>
      </td>
      {selectedButton === "Unavailable Nannies" && (
        <>
          <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
            {item.last_seen}
          </td>
          <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
            {item.reason}
          </td>
        </>
      )}
      <td className="px-3 py-3 text-xs font-inter whitespace-nowrap max-w-[80px] sm:whitespace-normal">
        {item.offers}
      </td>
    </tr>
  );
};
