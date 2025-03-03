"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

// Define a schema for the preference modal (adjust validations as needed)
const preferenceSchema = z.object({});

type PreferenceFormValues = z.infer<typeof preferenceSchema>;

interface PreferenceMummyModalProps {
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}

// Define a type for Religion based on the generated enum literal union.
type Religion = "christian" | "islam" | "hindu" | "pagan" | "non_religious";

// Array of religions with display labels and exact literal values.
const religionOptions: { label: string; value: Religion }[] = [
  { label: "Christian", value: "christian" },
  { label: "Islam", value: "islam" },
  { label: "Hindu", value: "hindu" },
  { label: "Pagan", value: "pagan" },
  { label: "Non-religious", value: "non_religious" },
];

interface Tribe {
  id: string;
  label: string;
}

// Define an interface for the row returned by the tribe query.
interface TribeRow {
  B: string;
  tribes: Tribe;
}

// Removed the unused interface: SearchTribeParams

const PreferenceMummyModal: React.FC<PreferenceMummyModalProps> = ({ onClose, onBack, onNext }) => {
  // Moved inside the component
  const [submitting, setSubmitting] = useState(false); // CHANGE: Added submission state inside the component

  const { handleSubmit } = useForm<PreferenceFormValues>({
    resolver: zodResolver(preferenceSchema),
  });

  // 1. Toggle for preferences
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);

  // 2. Preferred Religions using literal type Religion.
  const [selectedReligions, setSelectedReligions] = useState<Religion[]>([]);
  const toggleReligion = (religion: Religion) => {
    if (selectedReligions.includes(religion)) {
      setSelectedReligions(selectedReligions.filter((r) => r !== religion));
    } else {
      if (selectedReligions.length < 3) {
        setSelectedReligions([...selectedReligions, religion]);
      } else {
        toast.error("You can select at most 3 religions");
      }
    }
  };

  // 3. Preferred Tribes
  const [tribeInput, setTribeInput] = useState<string>("");
  const [selectedTribes, setSelectedTribes] = useState<Tribe[]>([]);
  const [tribeSuggestions, setTribeSuggestions] = useState<Tribe[]>([]);

  // Search for tribes via an RPC function.
  const searchTribes = async (searchTerm: string) => {
    const client = createClient();
    if (searchTerm.trim() === "") {
      setTribeSuggestions([]);
      return;
    }
    // Cast the response to ensure data is treated as Tribe[]
    const { data, error } = await client.rpc("search_tribe", { tribe_name: searchTerm }) as { data: Tribe[] | null, error: PostgrestError | null };
    if (error) {
      console.error("Error searching tribes:", error);
      return;
    }
    setTribeSuggestions(data || []);
  };

  const addTribe = (tribe: Tribe) => {
    if (!selectedTribes.find((t) => t.id === tribe.id)) {
      setSelectedTribes([...selectedTribes, tribe]);
    }
    setTribeInput("");
    setTribeSuggestions([]);
  };

  const removeTribe = (tribeId: string) => {
    setSelectedTribes(selectedTribes.filter((t) => t.id !== tribeId));
  };

  // 4. Pre-populate preferences if they exist.
  const [mammiesId, setMammiesId] = useState<string | null>(null);

  const fetchPreferenceData = async () => {
    const client = createClient();
    const mummyUserId = localStorage.getItem("mummyUserId");
    if (!mummyUserId) {
      console.error("No mummy user ID found in storage.");
      return;
    }
    const { data, error } = await client
      .from("mammies")
      .select("id, preferred_religions")
      .eq("user_id", mummyUserId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching preference data:", error);
      return;
    }
    if (data) {
      setMammiesId(data.id);
      localStorage.setItem("mammiesId", data.id);
      if (data.preferred_religions) {
        setHasPreferences(true);
        setSelectedReligions(data.preferred_religions);
      } else {
        setHasPreferences(false);
      }
    }
    
    const { data: tribeData, error: tribeError } = await client
      .from("_mammyToPreferredTribe")
      .select("B, tribes (id, label)")
      .eq("A", mummyUserId);
    if (tribeError) {
      console.error("Error fetching preferred tribes:", tribeError);
      return;
    }
    if (tribeData) {
      const tribesFromDB: Tribe[] = tribeData
        .map((row: TribeRow) => row.tribes)
        .filter(Boolean);
      setSelectedTribes(tribesFromDB);
    }
  };

  useEffect(() => {
    fetchPreferenceData();
  }, []);

  useEffect(() => {
    if (tribeInput.trim().length > 0) {
      searchTribes(tribeInput);
    } else {
      setTribeSuggestions([]);
    }
  }, [tribeInput]);

  // 5. Handle form submission.
  const onSubmit = async () => {
    setSubmitting(true); // CHANGE: Set submitting true at start
    const mummyUserId = localStorage.getItem("mummyUserId");
    if (!mummyUserId) {
      toast.error("No mummy user ID found. Please complete previous steps.");
      setSubmitting(false); // CHANGE: Reset submitting on error
      return;
    }
    const client = createClient();

    if (hasPreferences === true && selectedReligions.length === 0) {
      toast.error("Please select at least one religion.");
      setSubmitting(false); // CHANGE: Reset submitting on error
      return;
    }

    const { error } = await client
      .from("mammies")
      .upsert(
        {
          user_id: mummyUserId,
          preferred_religions: hasPreferences === true ? selectedReligions : [],
        },
        { onConflict: "user_id" }
      );
    if (error) {
      toast.error("Error saving preference information.");
      console.error("Error saving preference information:", error);
      setSubmitting(false); // CHANGE: Reset submitting on error
      return;
    }

    if (!mammiesId) {
      toast.error("Mammies record not found. Please complete previous steps.");
      setSubmitting(false); // CHANGE: Reset submitting on error
      return;
    }
   
    const { error: deleteError } = await client
      .from("_mammyToPreferredTribe")
      .delete()
      .eq("A", mammiesId);
    if (deleteError) {
      console.error("Error deleting old tribe preferences:", deleteError);
    }
    if (selectedTribes.length > 0) {
      const rows = selectedTribes.map((tribe) => ({
        A: mammiesId,
        B: tribe.id,
      }));
      const { error: insertError } = await client
        .from("_mammyToPreferredTribe")
        .upsert(rows, { onConflict: "A,B" });
      if (insertError) {
        toast.error("Error saving preferred tribes.");
        console.error("Error saving preferred tribes:", insertError);
        setSubmitting(false); // CHANGE: Reset submitting on error
        return;
      }
    }

    toast.success("Preferences saved successfully!");
    setSubmitting(false); // CHANGE: Reset submitting after submission
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
                <div className="h-full rounded-md bg-[#6000DA] w-[28%]"></div>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="w-full p-3 space-y-6">
            <h2 className="font-barlow font-semibold text-lg mb-4">Set Preferences</h2>

            {/* Preference Toggle */}
            <div>
              <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                Does the mummy have any specific preferences on tribe or religion?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setHasPreferences(true)}
                  className={`px-5 py-3 text-xs rounded-[24px] ${
                    hasPreferences === true
                      ? "border-2 border-[#6000DA] bg-[#6000DA12] text-[#6000DA]"
                      : "border border-gray-300 bg-white text-black"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasPreferences(false);
                    setSelectedReligions([]);
                    setSelectedTribes([]);
                  }}
                  className={`px-5 py-3 text-xs rounded-[24px] ${
                    hasPreferences === false
                      ? "border-2 border-[#6000DA] bg-[#6000DA12] text-[#6000DA]"
                      : "border border-gray-300 bg-white text-black"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Show additional fields only if preferences are enabled */}
            {hasPreferences === true && (
              <>
                {/* Preferred Religions */}
                <div>
                  <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                    Preferred Religion(s) (Select 1 to 3)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {religionOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleReligion(option.value)}
                        className={`px-5 py-3 text-xs rounded-[24px] ${
                          selectedReligions.includes(option.value)
                            ? "border-2 border-[#6000DA] bg-[#6000DA12] text-[#6000DA]"
                            : "border border-gray-300 bg-white text-black"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Tribes */}
                <div>
                  <label className="block font-barlow text-sm font-medium text-gray-700 mb-2">
                    Preferred Tribe(s)
                  </label>
                  <div className="flex gap-3 items-center mb-4">
                    <input
                      type="text"
                      value={tribeInput}
                      onChange={(e) => setTribeInput(e.target.value)}
                      placeholder="Search tribe..."
                      className="p-2 border border-gray-300 rounded-md md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tribeSuggestions.length > 0) {
                          addTribe(tribeSuggestions[0]);
                        } else if (tribeInput.trim() !== "") {
                          toast.error("No matching tribe found.");
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg flex items-center justify-center"
                    >
                      <Image src="/mummies-assets/add.svg" alt="Add Tribe" width={20} height={20} />
                    </button>
                  </div>
                  {tribeSuggestions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-barlow text-gray-600">Suggestions:</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {tribeSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => addTribe(suggestion)}
                            className="px-4 py-2 bg-gray-100 rounded-full text-sm"
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedTribes.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {selectedTribes.map((tribe) => (
                        <div key={tribe.id} className="flex items-center gap-2 bg-[#6000DA12] border border-[#6000DA] rounded-full px-4 py-2">
                          <span className="text-sm font-barlow">{tribe.label}</span>
                          <button
                            type="button"
                            onClick={() => removeTribe(tribe.id)}
                            className="text-red-500"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
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
