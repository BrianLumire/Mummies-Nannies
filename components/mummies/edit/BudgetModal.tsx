"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { Database } from "@/database.types";

// Derive the Insert type for the mammies table.
type MammiesInsert = Database["public"]["Tables"]["mammies"]["Insert"];

// Mapping from UI budget labels to corresponding salary_range_id (UUIDs from your salary_range table)
const salaryMapping: Record<string, string> = {
  "6k-9k": "5c5dfaf7-0240-4b6e-b814-e320712009e2",
  "10k-15k": "99938c1d-e15d-4fda-98d0-8cb8f6f9aa3c",
  "16k-20k": "d8d5e3d7-b96a-4a51-9238-0dbf7b254131",
  "Above 20k": "dc1ea573-9646-45e2-a5eb-f32711eaecbb",
};

// Create reverse mapping from salary_range_id to UI label.
const reverseSalaryMapping: Record<string, string> = Object.keys(salaryMapping).reduce(
  (acc, key) => {
    const value = salaryMapping[key];
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>
);

interface BudgetMummyModalProps {
  onClose: () => void;
  onComplete: () => void;
  onBack: () => void;
  mammiesId: string; // The specific mammies record id passed from the route
}

const EditBudgetMummyModal: React.FC<BudgetMummyModalProps> = ({ onClose, onComplete, onBack, mammiesId }) => {
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch existing salary_range_id for the mammies record and pre-populate the budget.
  const fetchBudgetData = async () => {
    setLoading(true);
    const supabase = createClient();
    // Use the passed mammiesId to query the record.
    const { data, error } = await supabase
      .from("mammies")
      .select("salary_range_id")
      .eq("id", mammiesId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching budget data:", error);
      toast.error("Error fetching budget data.");
    } else if (data && data.salary_range_id) {
      // Convert the DB salary_range_id into the UI label.
      const budgetOption = reverseSalaryMapping[data.salary_range_id];
      if (budgetOption) {
        setSelectedBudget(budgetOption);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgetData();
  }, [mammiesId]);

  // Handle form submission: update the mammies record.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBudget) {
      toast.error("Please select a budget option before proceeding.");
      return;
    }

    // Use the passed mammiesId directly.
    if (!mammiesId) {
      toast.error("Mammies information not found. Please complete previous steps.");
      return;
    }

    // Map the selected budget label to its corresponding salary_range_id.
    const salaryRangeId = salaryMapping[selectedBudget];
    if (!salaryRangeId) {
      toast.error("Selected budget option is invalid.");
      return;
    }

    const payload: MammiesInsert = {
      id: mammiesId,
      salary_range_id: salaryRangeId,
    };

    const supabase = createClient();
    setLoading(true);
    try {
      const { data: upsertedData, error } = await supabase
        .from("mammies")
        .upsert(payload, { onConflict: "id" });
      if (error) {
        console.error("Upsert error:", error);
        toast.error("Failed to update salary information. Please try again.");
        setLoading(false);
        return;
      }
      console.log("Upsert successful:", upsertedData);
      toast.success("Mummy has been updated successfully!");
      setLoading(false);
      onComplete();
    } catch (err: unknown) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Title & Progress Section */}
            <div className="w-full p-3">
              <div className="flex items-center mb-5 border-b justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-[6px] rounded-lg bg-gray-100" onClick={onBack}>
                    <Image src="/mummies-assets/back-arrow.svg" alt="Back Arrow" width={20} height={20} />
                  </button>
                  <h1 className="font-barlow font-semibold text-lg">Edit Mummy</h1>
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
                  {/* Final step: progress bar filled to 100% */}
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
              <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
                Complete
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBudgetMummyModal;
