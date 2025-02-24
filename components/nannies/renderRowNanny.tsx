// /utils/renderRowNanny.tsx
"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Nanny } from "@/components/nannies/TableNanny";

export const renderRowNanny = (item: Nanny, selectedButton: string, router: ReturnType<typeof useRouter>) => {
 
  if (selectedButton === "Available Nannies") {
    return (
      <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 text-xs  max-w-[90px] font-inter  whitespace-nowrap sm:whitespace-normal">
          <button
            className="flex items-center gap-3"
            onClick={() => router.push(`/admin/nannies/${item.id}`)}
          >
            <Image
              src={item.photo}
              alt={`${item.name}'s photo`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xs font-inter">{item.name}</span>
          </button>
        </td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap  max-w-[80px] sm:whitespace-normal">{item.phonenumber}</td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap  max-w-[80px] sm:whitespace-normal">{item.location}</td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap  max-w-[80px] sm:whitespace-normal">{item.budgetrange}</td>
        <td className="px-3 py-3   whitespace-nowrap sm:whitespace-normal ">
          <div className="px-2 flex  items-center justify-center whitespace-nowrap border  w-1/2 border-black rounded-lg py-[2px] bg-white text-[9px] font-inter text-black">
          {item.availablefor}
          </div>
          </td>
        <td className="px-3 py-3   whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-2">
            <Image src={item.ratingphoto} alt="Rating" width={18} height={18} />
            <span className="text-xs font-inter">{item.rating}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.workterms ?? "N/A"}</td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.offers}</td>
      </tr>
    );
  } else if (selectedButton === "Unavailable Nannies") {
    return (
      <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 text-xs max-w-[110px] font-inter  whitespace-nowrap sm:whitespace-normal">
          <button
            className="flex items-center gap-3"
            onClick={() => router.push(`/admin/nannies/${item.id}`)}
          >
            <Image
              src={item.photo}
              alt={`${item.name}'s photo`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span>{item.name}</span>
          </button>
        </td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.phonenumber}</td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.location}</td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.budgetrange}</td>
        <td className="px-3 py-3   whitespace-nowrap sm:whitespace-normal ">
          <div className="px-2 flex  items-center justify-center whitespace-nowrap border min-w-[110px] w-1/2  border-black rounded-lg py-[2px] bg-white text-[9px] font-inter text-black">
          {item.availablefor}
          </div>
          </td>
        <td className="px-3 py-3   whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-2">
            <Image src={item.ratingphoto} alt="Rating" width={18} height={18} />
            <span className="text-xs font-inter">{item.rating}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.lastseen ?? "N/A"}</td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.reason ?? "N/A"}</td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.offers}</td>
      </tr>
    );
  }
  return null;
};
