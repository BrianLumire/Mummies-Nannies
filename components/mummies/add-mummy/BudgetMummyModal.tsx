"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { Database } from "@/database.types";

// Derive the Insert type for the mammies table.
type MammiesInsert = Database["public"]["Tables"]["mammies"]["Insert"];

// Mapping from UI budget labels to corresponding salary_range_id.
const salaryMapping: Record<string, string> = {
  "6k-9k": "5c5dfaf7-0240-4b6e-b814-e320712009e2",
  "10k-15k": "99938c1d-e15d-4fda-98d0-8cb8f6f9aa3c",
  "16k-20k": "d8d5e3d7-b96a-4a51-9238-0dbf7b254131",
  "Above 20k": "dc1ea573-9646-45e2-a5eb-f32711eaecbb",
};

interface BudgetMummyModalProps {
  onClose: () => void;
  onComplete: () => void;
  onBack: () => void;
}

const BudgetMummyModal: React.FC<BudgetMummyModalProps> = ({ onClose, onComplete, onBack }) => {
  // State for the selected budget option.
  const [selectedBudget, setSelectedBudget] = useState("");
  
  // NEW: State for submission progress.
  const [submitting, setSubmitting] = useState(false);

  // Define a function to fetch existing budget data.
  const fetchBudgetData = useCallback(async () => {
    const mammiesId = localStorage.getItem("mammiesId");
    if (!mammiesId) return;
    const client = createClient();
    const { data, error } = await client
      .from("mammies")
      .select("salary_range_id")
      .eq("id", mammiesId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching budget data:", error);
      return;
    }
    if (data && data.salary_range_id) {
      // Find the budget option that matches the salary_range_id.
      const budgetOption = Object.keys(salaryMapping).find(
        (key) => salaryMapping[key] === data.salary_range_id
      );
      if (budgetOption) {
        setSelectedBudget(budgetOption);
      }
    }
  }, []);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBudget) {
      toast.error("Please select a budget option before proceeding.");
      return;
    }

    // Retrieve the mammies primary key from localStorage.
    const mammiesId = localStorage.getItem("mammiesId");
    if (!mammiesId) {
      toast.error("Mammies information not found. Please complete previous steps.");
      return;
    }

    // Map the selected budget label to its corresponding salary_range_id.
    const salaryRangeId = salaryMapping[selectedBudget] || null;
    if (!salaryRangeId) {
      toast.error("Selected budget option is invalid.");
      return;
    }

    // Build the payload for upserting into the mammies table.
    const payload: MammiesInsert = {
      id: mammiesId,
      salary_range_id: salaryRangeId,
    };

    const supabase = createClient();

    setSubmitting(true);
    
    try {
      const { data: upsertedData, error } = await supabase
        .from("mammies")
        .upsert(payload, { onConflict: "id" });
      if (error) {
        console.error("Upsert error:", error);
        toast.error("Failed to update salary information. Please try again.");
        setSubmitting(false);
        return;
      }
      console.log("Upsert successful:", upsertedData);
      toast.success("Mummy has been onboarded successfully!");
      setSubmitting(false);
      onComplete();
    } catch (err: unknown) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%]">
        <form onSubmit={handleSubmit}>
          {/* Title & Progress Section */}
          <div className="w-full p-3">
            <div className="flex items-center mb-5 border-b justify-between">
              <div className="flex items-center gap-2">
                <button className="p-[6px] rounded-lg bg-gray-100" onClick={onBack}>
                  <Image src="/mummies-assets/back-arrow.svg" alt="Back Arrow" width={20} height={20} />
                </button>
                <h1 className="font-barlow font-semibold text-lg">Onboard New Mummy</h1>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 flex items-center justify-center bg-[#FAFAFA] rounded-full"
              >
                <Image src="/nannies-assets/close.svg" alt="Close Icon" width={20} height={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4 md:gap-7 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm md:text-base font-barlow">Bio Information</span>
                <span className="text-sm md:text-base font-barlow">Services Needed</span>
                <span className="text-sm md:text-base font-barlow">Preferences</span>
                <span className="text-sm md:text-base font-barlow">Residents</span>
                <span className="text-sm md:text-base font-barlow">Budget</span>
              </div>
              <div className="w-full h-1 rounded-md bg-[#cccaca54]">
                {/* Final step: progress bar (here set to 50% as a visual placeholder) */}
                <div className="h-full rounded-md bg-[#6000DA] w-[50%]"></div>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="w-full p-3 space-y-6">
            <h2 className="font-barlow font-semibold text-lg mb-4">Set Budget</h2>
            <div>
              <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                Select the mummy&apos;s budget for a nanny
              </label>
              <div className="flex gap-4 flex-wrap">
                {["6k-9k", "10k-15k", "16k-20k", "Above 20k"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedBudget(option)}
                    className={`px-5 py-3 text-xs rounded-[24px] ${
                      selectedBudget === option
                        ? "border-2 border-[#6000DA] bg-[#6000DA12] text-[#6000DA]"
                        : "border border-gray-300 bg-white text-black"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full p-3 flex items-center justify-center md:justify-end gap-3">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-[#F5F5F5] rounded-lg">
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 rounded-lg text-white ${
                submitting ? "bg-[#6000DA] opacity-50 cursor-not-allowed" : "bg-[#6000DA]"
              }`}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                "Complete"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetMummyModal;
