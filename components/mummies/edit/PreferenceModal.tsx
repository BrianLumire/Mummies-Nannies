"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

// Schema for preference modal (no additional form fields for now)
const preferenceSchema = z.object({});

type PreferenceFormValues = z.infer<typeof preferenceSchema>;

interface PreferenceMummyModalProps {
  mammiesId: string; // ID from mammies table (passed via route)
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}

// Define a type for Religion based on your DB enum.
type Religion = "christian" | "islam" | "hindu" | "pagan" | "non_religious";

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

const EditPreferenceMummyModal: React.FC<PreferenceMummyModalProps> = ({
  mammiesId,
  onClose,
  onBack,
  onNext,
}) => {
  const { handleSubmit } = useForm<PreferenceFormValues>({
    resolver: zodResolver(preferenceSchema),
  });

  // 1. Toggle for preferences (if the mummy has specific preferences)
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);

  // 2. Preferred Religions (from the mammies table)
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

  // RPC function to search tribes.
  const searchTribes = async (searchTerm: string) => {
    const client = createClient();
    if (searchTerm.trim() === "") {
      setTribeSuggestions([]);
      return;
    }
    const { data, error } = await (client.rpc as any)("search_tribe", {
      tribe_name: searchTerm,
    });
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

  // Loading state.
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch preference data for this specific mummy.
  const fetchPreferenceData = async () => {
    setLoading(true);
    const client = createClient();
    // Use the mammiesId (primary key) to fetch the record.
    const { data, error } = await client
      .from("mammies")
      .select("preferred_religions")
      .eq("id", mammiesId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching preference data:", error);
      toast.error("Error fetching preference data.");
    } else if (data) {
      if (data.preferred_religions && data.preferred_religions.length > 0) {
        setHasPreferences(true);
        setSelectedReligions(data.preferred_religions);
      } else {
        setHasPreferences(false);
      }
    }

    // Fetch preferred tribes from the join table.
    const { data: tribeData, error: tribeError } = await client
      .from("_mammyToPreferredTribe")
      .select("B, tribes (id, label)")
      .eq("A", mammiesId);
    if (tribeError) {
      console.error("Error fetching preferred tribes:", tribeError);
    } else if (tribeData) {
      const tribesFromDB: Tribe[] = tribeData
        .map((row: any) => row.tribes)
        .filter(Boolean);
      setSelectedTribes(tribesFromDB);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPreferenceData();
  }, [mammiesId]);

  // Update tribe suggestions when tribeInput changes.
  useEffect(() => {
    if (tribeInput.trim().length > 0) {
      searchTribes(tribeInput);
    } else {
      setTribeSuggestions([]);
    }
  }, [tribeInput]);

  // Handle form submission: update preferences and tribe join table.
  const onSubmit = async () => {
    // We use the passed mammiesId to update this specific mummy.
    const client = createClient();
    if (!mammiesId) {
      toast.error("No mummy ID found. Please complete previous steps.");
      return;
    }
    // If preferences are enabled, ensure at least one religion is selected.
    if (hasPreferences === true && selectedReligions.length === 0) {
      toast.error("Please select at least one religion.");
      return;
    }
    setLoading(true);
    // Update the mammies record with the preferred_religions.
    const { error } = await client
      .from("mammies")
      .upsert(
        {
          id: mammiesId,
          preferred_religions: hasPreferences === true ? selectedReligions : [],
        },
        { onConflict: "id" }
      );
    if (error) {
      console.error("Error saving preference information:", error);
      toast.error("Error saving preference information.");
      setLoading(false);
      return;
    }
    // Now update the join table for preferred tribes.
    // First, clear existing rows for this mammiesId.
    const { error: deleteError } = await client
      .from("_mammyToPreferredTribe")
      .delete()
      .eq("A", mammiesId);
    if (deleteError) {
      console.error("Error deleting old tribe preferences:", deleteError);
      // Optionally, continue even if delete fails.
    }
    // Insert new rows for each selected tribe.
    if (selectedTribes.length > 0) {
      const rows = selectedTribes.map((tribe) => ({
        A: mammiesId,
        B: tribe.id,
      }));
      const { error: insertError } = await client
        .from("_mammyToPreferredTribe")
        .upsert(rows, { onConflict: "A,B" });
      if (insertError) {
        console.error("Error saving preferred tribes:", insertError);
        toast.error("Error saving preferred tribes.");
        setLoading(false);
        return;
      }
    }
    toast.success("Preferences saved successfully!");
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
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Title & Progress Section */}
            <div className="w-full p-3">
              <div className="flex items-center mb-5 border-b justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-[6px] rounded-lg bg-gray-100"
                    onClick={onBack}
                  >
                    <Image
                      src="/mummies-assets/back-arrow.svg"
                      alt="Back Arrow"
                      width={20}
                      height={20}
                    />
                  </button>
                  <h1 className="font-barlow font-semibold text-lg">Edit Mummy</h1>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 flex items-center justify-center bg-[#FAFAFA] rounded-full"
                >
                  <Image
                    src="/nannies-assets/close.svg"
                    alt="Close Icon"
                    width={20}
                    height={20}
                  />
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
                  {/* Assuming step 3 of 5 (60% progress) */}
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
                        <Image
                          src="/mummies-assets/add.svg"
                          alt="Add Tribe"
                          width={20}
                          height={20}
                        />
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
                          <div
                            key={tribe.id}
                            className="flex items-center gap-2 bg-[#6000DA12] border border-[#6000DA] rounded-full px-4 py-2"
                          >
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

export default EditPreferenceMummyModal;
