"use client";
import React, { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

interface SuspendMummyModalProps {
  mummyId: string; // Add this property if not already defined
  onClose: () => void;
  onConfirm: (reasonId: string) => void;
}


const suspensionReasons: { id: string; label: string }[] = [
  {
    id: "b7cbff1a-4bb5-4474-8407-800c2d098546",
    label: "Child abuse or neglect (physical, emotional, or verbal).",
  },
  {
    id: "8c75aac4-8694-4540-80f1-3db8da035431",
    label: "Theft or property damage.",
  },
  {
    id: "383851e6-c33a-41dd-b314-8e7bc84bd964",
    label: "Substance abuse while on duty.",
  },
  {
    id: "da985cc6-7d3f-4f52-99c6-4b307adb096a",
    label:
      "Inappropriate behavior towards the child or family members (e.g., harassment, sexual misconduct).",
  },
  {
    id: "560f55cb-585f-49a0-b10f-21113ba345c4",
    label:
      "Breach of confidentiality regarding the family's private information.",
  },
  {
    id: "3a354f5e-cdca-44e4-bfd4-17c2feffb974",
    label: "Attempting to circumvent the platform's payment system.",
  },
];

const SuspendMummyModal: React.FC<SuspendMummyModalProps> = ({ mummyId, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState<string>("");

  // When the admin clicks "Suspend", we call onConfirm with the selected reason.
  // In the parent component, onConfirm will be used to update the record.
  const handleConfirm = () => {
    if (!selectedReason) {
      toast.error("Please select a suspension reason before proceeding.");
      return;
    }
    console.log("Suspending mummy with ID:", mummyId, "Reason:", selectedReason);
    onConfirm(selectedReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95%] md:w-[60%] p-6">
        <div className="flex flex-col mb-5 border-b justify-between">
          <div className="flex items-center justify-between w-full">
            <h1 className="font-barlow font-semibold text-lg">Suspend Mummy Account</h1>
            <button
              type="button"
              onClick={onClose}
              className="p-2 flex items-center justify-center bg-[#FAFAFA] rounded-full"
            >
              <Image src="/nannies-assets/close.svg" alt="Close Icon" width={20} height={20} />
            </button>
          </div>
          <p className="text-sm text-left font-barlow">
            This user will be denied access to their account until the suspension is revoked.
          </p>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="font-barlow font-medium">Select the suspension reason</h1>
          {suspensionReasons.map((reason) => (
            <div
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              className={`w-full border rounded-lg p-2 cursor-pointer font-barlow ${
                selectedReason === reason.id ? "border-blue-500 bg-blue-100" : "border-gray-300"
              }`}
            >
              {reason.label}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-gray-300 rounded-lg text-base font-medium font-barlow text-red-500"
          >
            Suspend
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#6000DA] text-white rounded-lg text-base font-medium font-barlow"
          >
            Keep Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendMummyModal;
