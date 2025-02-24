// /components/Mummies/renderRowMummy.tsx
"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mummy } from "@/components/mummies/TableMummy";

export const renderRowMummy = (item: Mummy, selectedButton: string) => {
  const router = useRouter();
  if (selectedButton === "Active Mummies") {
    return (
      <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 whitespace-nowrap sm:whitespace-normal">
          <button
            className="flex items-center gap-2"
            onClick={() => router.push(`/admin/mummies/${item.id}`)}
          >
            <Image
              src={item.photo}
              alt={`${item.name}'s photo`}
              width={33}
              height={33}
              className="rounded-full"
            />
            <span className="text-xs font-inter ">{item.name}</span>
          </button>
        </td>
        <td className="px-3 py-3 text-xs font-inter  whitespace-nowrap sm:whitespace-normal">{item.phonenumber}</td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.location}</td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.lookingfor}</td>
        <td className="px-3 py-3  whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-1">
            <Image src={item.ratingphoto} alt="Rating" width={18} height={18} />
            <span className="text-xs font-inter">{item.rating}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.budgetrange}</td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.pitchednannies}</td>
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
              src={item.photo}
              alt={`${item.name}'s photo`}
              width={33}
              height={33}
              className="rounded-full"
            />
            <span>{item.name}</span>
          </button>
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.phonenumber}</td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.lookingfor}</td>
        <td className="px-3 py-3  whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-1">
            <Image src={item.ratingphoto} alt="Rating" width={18} height={18} />
            <span className="text-xs font-inter">{item.rating}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.budgetrange}</td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.pitchednannies}</td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.lastseen ?? "N/A"}</td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">{item.suspenionfor ?? "N/A"}</td>
      </tr>
    );
  }
  return null;
};
