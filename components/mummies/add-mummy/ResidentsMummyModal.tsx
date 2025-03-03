"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

// Schema for residents form (extend validations as needed)
const residentsSchema = z.object({});

type ResidentsFormValues = z.infer<typeof residentsSchema>;

interface ResidentsMummyModalProps {
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
}

// UI options for kids preferred (as shown to the admin)
const kidsOptions = ["1-2 kids", "1-5 kids", "More than 5"];

// Mapping from UI kids option to DB enum value
const kidsMapping: Record<string, "one_to_two" | "one_to_five" | "more_than_five"> = {
  "1-2 kids": "one_to_two",
  "1-5 kids": "one_to_five",
  "More than 5": "more_than_five",
};

// UI options for age ranges
const ageRangeOptions = ["0-1 year", "1-3 years", "3 years and above"];

// Mapping from UI age range to DB enum value
const ageRangeMapping: Record<string, "zero_to_one" | "one_to_three" | "three_and_above"> = {
  "0-1 year": "zero_to_one",
  "1-3 years": "one_to_three",
  "3 years and above": "three_and_above",
};

// Reverse mapping to pre-populate UI (DB -> UI)
const reverseAgeRangeMapping: Record<"zero_to_one" | "one_to_three" | "three_and_above", string> = {
  zero_to_one: "0-1 year",
  one_to_three: "1-3 years",
  three_and_above: "3 years and above",
};



const PreferenceMummyModal: React.FC<ResidentsMummyModalProps> = ({ onClose, onNext, onBack }) => {
  const { handleSubmit } = useForm<ResidentsFormValues>({
    resolver: zodResolver(residentsSchema),
  });

  // State for kids preferred (single selection)
  const [kidsPreferred, setKidsPreferred] = useState<string>("");
  // State for age ranges (multiple selection allowed)
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  // State for adults (as a string, will convert to number on submit)
  const [adults, setAdults] = useState<string>("");
  // NEW: State for location input
  const [location, setLocation] = useState<string>("");

  // NEW: State to track submission status.
  const [submitting, setSubmitting] = useState(false); // CHANGE: Added submission state

  // Fetch existing residents data to pre-populate the fields.
  const fetchResidentsData = async () => {
    const client = createClient();
    const mummyUserId = localStorage.getItem("mummyUserId");
    if (!mummyUserId) {
      console.error("No mummy user ID found in storage.");
      return;
    }
    const { data, error } = await client
      .from("mammies")
      .select("kids_count, age_group, adult_count, location")
      .eq("user_id", mummyUserId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching residents data:", error);
      return;
    }
    if (data) {
      if (data.kids_count && data.kids_count.length > 0) {
        // Reverse map DB kids_count to UI string if necessary.
        const reverseKidsMapping: Record<"one_to_two" | "one_to_five" | "more_than_five", string> = {
          one_to_two: "1-2 kids",
          one_to_five: "1-5 kids",
          more_than_five: "More than 5",
        };
        setKidsPreferred(reverseKidsMapping[data.kids_count[0]]);
      }
      if (data.age_group) {
        setSelectedAgeRanges(
          (data.age_group as ("zero_to_one" | "one_to_three" | "three_and_above")[]).map(
            (val) => reverseAgeRangeMapping[val]
          )
        );
      }
      if (data.adult_count !== null && data.adult_count !== undefined) {
        setAdults(String(data.adult_count));
      }
      // NEW: Prepopulate location
      if (data.location) {
        setLocation(data.location);
      }
    }
  };

  useEffect(() => {
    fetchResidentsData();
  }, []);

  // Toggle selection for age ranges
  const toggleAgeRange = (range: string) => {
    if (selectedAgeRanges.includes(range)) {
      setSelectedAgeRanges(selectedAgeRanges.filter(r => r !== range));
    } else {
      setSelectedAgeRanges([...selectedAgeRanges, range]);
    }
  };

  // Handle form submission and upsert residents data.
  const onSubmit = async () => {
    // Validation checks
    if (!kidsPreferred) {
      toast.error("Please select an option for number of kids preferred.");
      return;
    }
    if (selectedAgeRanges.length === 0) {
      toast.error("Please select at least one age range.");
      return;
    }
    if (!adults) {
      toast.error("Please enter the number of adults in your household.");
      return;
    }
    if (!location) {
      toast.error("Please enter the mummy's location.");
      return;
    }

    const mummyUserId = localStorage.getItem("mummyUserId");
    if (!mummyUserId) {
      toast.error("No user account found. Please complete previous steps.");
      return;
    }

    const client = createClient();

    // Map UI selections to DB enum values.
    const mappedKidsCount = [kidsMapping[kidsPreferred]]; // Convert kidsPreferred to DB value.
    const mappedAgeGroups = selectedAgeRanges.map(range => ageRangeMapping[range]);

    const payload = {
      user_id: mummyUserId,
      kids_count: mappedKidsCount,
      age_group: mappedAgeGroups,
      adult_count: parseInt(adults, 10),
      location: location, // Include location here.
    };

    setSubmitting(true); // CHANGE: Set submitting to true at beginning of submission

    const { error } = await client
      .from("mammies")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      toast.error("Error saving residents information.");
      console.error("Error saving residents information:", error);
      setSubmitting(false); // CHANGE: Reset submitting on error
      return;
    }

    toast.success("Residents information saved successfully!");
    setSubmitting(false); // CHANGE: Reset submitting at end of submission process
    onNext();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%]">
        <form onSubmit={handleSubmit(onSubmit)}>
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
                {/* For step 4 of 5, progress set to 80% */}
                <div className="h-full rounded-md bg-[#6000DA] w-[35%]"></div>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="w-full p-3 space-y-6">
            <h2 className="font-barlow font-semibold text-lg mb-4">Add Residents</h2>

            {/* Number of Kids Preferred */}
            <div>
              <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                Number of kids preferred
              </label>
              <div className="flex gap-4">
                {kidsOptions.map(option => (
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
                Select age range(s)
              </label>
              <div className="flex gap-4">
                {ageRangeOptions.map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => toggleAgeRange(range)}
                    className={`px-5 py-3 text-xs rounded-[24px] ${
                      selectedAgeRanges.includes(range)
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
                Number of adults (over 18 years old)
              </label>
              <input
                type="number"
                placeholder="Enter number"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Mummy Location Input */}
            <div>
            <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
  Enter Mummy&apos;s Location
</label>

              <input
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full p-3 flex items-center justify-center md:justify-end gap-3">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-[#F5F5F5] rounded-lg">
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting} // CHANGE: Disable button when submitting is true
              className={`px-8 py-3 rounded-lg text-white ${
                submitting ? "bg-[#6000DA] opacity-50 cursor-not-allowed" : "bg-[#6000DA]"
              }`}
            >
              {submitting ? (
                // CHANGE: Conditionally render a spinner when submitting is true
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                "Proceed"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferenceMummyModal;
