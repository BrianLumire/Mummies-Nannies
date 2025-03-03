"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

interface ResidentsMummyModalProps {
  mammiesId: string; // Use the mammies table id passed from the route params
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
}

const EditResidentsMummyModal: React.FC<ResidentsMummyModalProps> = ({ mammiesId, onClose, onNext, onBack }) => {
  // State for kids preferred, age range and adults input.
  const [kidsPreferred, setKidsPreferred] = useState<string>("");
  const [ageRange, setAgeRange] = useState<string>("");
  const [adults, setAdults] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Mapping from DB enum values to UI strings (for pre-population)
  const reverseKidsMapping: Record<"one_to_two" | "one_to_five" | "more_than_five", string> = {
    one_to_two: "1-2 kids",
    one_to_five: "1-5 kids",
    more_than_five: "More than 5",
  };

  const reverseAgeMapping: Record<"zero_to_one" | "one_to_three" | "three_and_above", string> = {
    zero_to_one: "0-1 year",
    one_to_three: "1-3 years",
    three_and_above: "3 years and above",
  };

  // Fetch the existing residents data for the specific mummy using mammiesId.
  const fetchResidentsData = async () => {
    setLoading(true);
    const client = createClient();

    // Use mammiesId (primary key) to fetch the record.
    const { data, error } = await client
      .from("mammies")
      .select("kids_count, age_group, adult_count")
      .eq("id", mammiesId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching residents data:", error);
      toast.error("Error fetching residents data.");
      setLoading(false);
      return;
    }

    if (data) {
      // Pre-populate the kids preferred value (assume array with one value)
      if (data.kids_count && data.kids_count.length > 0) {
        setKidsPreferred(reverseKidsMapping[data.kids_count[0]]);
      }
      // Pre-populate the age range (for simplicity, assume single selection)
      if (data.age_group && data.age_group.length > 0) {
        setAgeRange(reverseAgeMapping[data.age_group[0]]);
      }
      if (data.adult_count !== null && data.adult_count !== undefined) {
        setAdults(String(data.adult_count));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResidentsData();
  }, [mammiesId]);

  // Handle form submission: update the mammies record.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidsPreferred || !ageRange || !adults) {
      toast.error("Please fill all fields before proceeding.");
      return;
    }
    
    setLoading(true);
    const client = createClient();

    // Map UI strings back to DB enum values.
    const kidsMapping: Record<string, "one_to_two" | "one_to_five" | "more_than_five"> = {
      "1-2 kids": "one_to_two",
      "1-5 kids": "one_to_five",
      "More than 5": "more_than_five",
    };
    const ageRangeMapping: Record<string, "zero_to_one" | "one_to_three" | "three_and_above"> = {
      "0-1 year": "zero_to_one",
      "1-3 years": "one_to_three",
      "3 years and above": "three_and_above",
    };

    const payload = {
      id: mammiesId, // Use the passed mammiesId to update the specific record.
      kids_count: [kidsMapping[kidsPreferred]], // Array of one value.
      age_group: [ageRangeMapping[ageRange]],      // Array of one value.
      adult_count: parseInt(adults, 10),
    };

    const { error } = await client.from("mammies").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("Error updating residents information:", error);
      toast.error("Error updating residents information.");
      setLoading(false);
      return;
    }
    toast.success("Residents information updated successfully!");
    setLoading(false);
    onNext();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
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
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onBack(); }}
                    className="p-[6px] rounded-lg bg-gray-100"
                  >
                    <Image src="/mummies-assets/back-arrow.svg" alt="Back Arrow" width={20} height={20} />
                  </button>
                  <h1 className="font-barlow font-semibold text-lg">Edit Residents</h1>
                </div>
                <button type="button" onClick={onClose} className="p-2 flex items-center justify-center bg-[#FAFAFA] rounded-full">
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
                  {/* Step 4 of 5: progress set to 80% */}
                  <div className="h-full rounded-md bg-[#6000DA] w-[35%]"></div>
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="w-full p-3 space-y-6">
              <h2 className="font-barlow font-semibold text-lg mb-4">Edit Residents Information</h2>
              
              {/* Number of Kids Preferred */}
              <div>
                <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                  Number of kids preferred
                </label>
                <div className="flex gap-4">
                  {["1-2 kids", "1-5 kids", "More than 5"].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setKidsPreferred(option)}
                      className={`px-5 py-3 text-xs rounded-[24px] ${
                        kidsPreferred === option
                          ? "border-2 border-[#6000DA] bg-[#6000DA12] text-[#6000DA]"
                          : "border border-gray-300 bg-white text-black"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range Selection */}
              <div>
                <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                  What's their age range?
                </label>
                <div className="flex gap-4">
                  {["0-1 year", "1-3 years", "3 years and above"].map(range => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setAgeRange(range)}
                      className={`px-5 py-3 text-xs rounded-[24px] ${
                        ageRange === range
                          ? "border-2 border-[#6000DA] bg-[#6000DA12] text-[#6000DA]"
                          : "border border-gray-300 bg-white text-black"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Residents Adults */}
              <div>
                <h3 className="font-barlow font-semibold text-lg mb-2">Residents Adults</h3>
                <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                  Adults in your household (over 18 years old)
                </label>
                <input
                  type="number"
                  placeholder="Enter number"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full p-3 flex items-center justify-center md:justify-end gap-3">
              <button type="button" onClick={onClose} className="px-8 py-3 bg-[#F5F5F5] rounded-lg">
                Discard
              </button>
              <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
                Proceed
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditResidentsMummyModal;
