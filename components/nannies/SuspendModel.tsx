"use client";
import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

interface SuspendModelProps {
  nannyId: string;
  onClose: () => void;
  onConfirm: () => void;
}

interface SuspensionReason {
  id: string;
  label: string;
}

const reasons: SuspensionReason[] = [
  { id: "1dfe9be2-05b7-4fbf-b3c3-e007f193615a", label: "Attempting to circumvent the platform's payment system." },
  { id: "36bc8512-a735-488a-a4ae-fc2d712e882a", label: "Substance abuse while on duty." },
  { id: "414a271f-8068-4742-ad93-2a27cf6aefe9", label: "Creating multiple accounts." },
  { id: "5131f82d-c910-4820-bd6e-6caacac87797", label: "Child abuse or neglect (physical, emotional, or verbal)." },
  { id: "863a289e-774c-4d08-8450-942ddd8b59e1", label: "Inappropriate behavior towards the child or family members (e.g., harassment, sexual misconduct)." },
  { id: "8fe28897-3f65-4e13-a1aa-6a360f1fda2f", label: "Breach of confidentiality regarding the family's private information." },
  { id: "a3b96904-d2b8-4ee7-ad44-2910aecd5c90", label: "Theft or property damage." },
];

const supabase = createClient();

const SuspendModel: React.FC<SuspendModelProps> = ({ nannyId, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
  };

  const handleSuspend = async () => {
    if (!selectedReason) {
      toast.error("Please select a suspension reason.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
  .from("nannies")
  .update({
    is_suspended: true,
    nanny_suspension_reason_id: selectedReason,
  })
  .eq("id", nannyId);


      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Nanny suspended successfully!");
        onConfirm();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95%] md:w-[60%] p-6">
        <div className="flex flex-col mb-5 border-b justify-between">
          <div className="flex items-center justify-between w-full">
            <h1 className="font-barlow font-semibold text-lg">Suspend Nanny Account</h1>
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
          {reasons.map((reason) => (
            <div
              key={reason.id}
              onClick={() => handleReasonSelect(reason.id)}
              className={`w-full border rounded-lg p-2 cursor-pointer ${
                selectedReason === reason.id ? "border-[#6000DA]" : "border-gray-300"
              }`}
            >
              <span className="font-barlow">{reason.label}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSuspend}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded-lg text-base font-medium font-barlow text-red-500"
          >
            {loading ? "Suspending..." : "Suspend"}
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

export default SuspendModel;
