"use client";
import React from "react";
import Image from "next/image";
import {
  AcceptedOffer,
  PendingOffer,
  DeclinedOffer,
} from "@/utils/nannies/nanniesData";

export const renderRowSingleNanny = (
  item: AcceptedOffer | PendingOffer | DeclinedOffer,
  selectedOfferTab: string
) => {
  

  // Common cell for the "Mummy" column (photo and name)
  const mummyCell = (
    <div className="flex items-center gap-3">
      <Image
        src={item.photo}
        alt={`${item.name}'s photo`}
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="text-xs font-inter">{item.name}</span>
    </div>
  );

  if (selectedOfferTab === "Accepted Offers") {
    const acceptedItem = item as AcceptedOffer;
    return (
      <tr key={acceptedItem.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 text-xs  font-inter whitespace-nowrap sm:whitespace-normal">
          {mummyCell}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {acceptedItem.servicesNeeded}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {acceptedItem.workLocation}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {acceptedItem.latestOffer}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {acceptedItem.acceptanceDate}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap sm:whitespace-normal">
          <div className="flex items-center gap-2">
            <Image
              src={acceptedItem.ratingphoto}
              alt="Rating"
              width={18}
              height={18}
            />
            <span>{acceptedItem.rating}</span>
          </div>
        </td>
      </tr>
    );
  } else if (selectedOfferTab === "Pending Offers") {
    const pendingItem = item as PendingOffer;
    return (
      <tr key={pendingItem.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 text-xs  font-inter whitespace-nowrap sm:whitespace-normal">
          {mummyCell}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {pendingItem.servicesNeeded}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {pendingItem.workLocation}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {pendingItem.latestOffer}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {pendingItem.lastInteraction}
        </td>
      </tr>
    );
  } else if (selectedOfferTab === "Declined Offers") {
    const declinedItem = item as DeclinedOffer;
    return (
      <tr key={declinedItem.id} className="border-b border-gray-300 hover:bg-gray-50">
        <td className="px-3 py-3 text-xs  font-inter whitespace-nowrap sm:whitespace-normal">
          {mummyCell}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {declinedItem.servicesNeeded}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {declinedItem.workLocation}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {declinedItem.latestOffer}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {declinedItem.date}
        </td>
        <td className="px-3 py-3 text-xs font-inter whitespace-nowrap  sm:whitespace-normal">
          {declinedItem.declinedBy}
        </td>
      </tr>
    );
  }
  return null;
};