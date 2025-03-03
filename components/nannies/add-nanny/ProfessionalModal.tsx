"use client";
import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "@/supabase/client";

// Define props for ProfessionalModal
interface ProfessionalModalProps {
  onBack: () => void;
  onClose: () => void;
  onComplete: () => void;
}

const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  onBack,
  onClose,
  onComplete,
}) => {
  // Local state for professional data
  const [selectedWorkTerm, setSelectedWorkTerm] = useState<"full_time" | "dayburg" | "">("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [preferredAgeGroup, setPreferredAgeGroup] = useState<string>("");
  const [numberOfKidsPreferred, setNumberOfKidsPreferred] = useState<string>(""); // will be converted on submit
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState<"high_school" | "associate" | "bachelor" | "master" | "doctorate" | "">("");
  const [salaryRangeId, setSalaryRangeId] = useState<string>(""); // The selected salary_range id
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);

  // Options arrays
  const servicesAvailableOptions = [
    { id: "ebf7459e-1f21-43e3-9411-519a2b39189f", label: "Child Care" },
    { id: "30f143cf-410f-49bb-af41-48577265a663", label: "Elderly Care" },
    { id: "991de8ec-f799-4fb7-aef4-711f3810c617", label: "Special Needs Care" },
  ];
  const preferredAgeGroupOptions = [
    { id: "49650c6e-d92d-40e7-aeea-5227922f5f52", label: "0-1 year" },
    { id: "ad2d12e1-f01c-44a2-9004-ac1145aeb525", label: "1-3 years" },
    { id: "f69660af-23fb-4564-b283-b18226d161b8", label: "3 years and above" },
  ];
  const numberOfKidsOptions = [
    { id: "f37225a6-c23c-44c2-aea2-355ab926779b", label: "Any number" },
    { id: "e59ee259-259d-42c2-ae42-9845c556e4e7", label: "1-2 kids" },
    { id: "e00f0254-e361-4ee3-9ca0-fbd72b92563c", label: "1-5 kids" },
  ];
  const preferredSpecialNeedsOptions = [
    { id: "44918e94-553b-4a7e-bacc-b0b46c0ca446", label: "Speech" },
    { id: "7018159b-a629-4d5c-8b55-68a8477a4ead", label: "Any" },
    { id: "833a0344-f203-48d6-9e77-da4c28824aa7", label: "Visual" },
    { id: "d189d4ed-20bb-4f27-a1f3-347d771f330f", label: "Hearing" },
    { id: "d5e13b6f-8e15-43f1-b25a-a13bea0a9157", label: "Mobility" },
    { id: "fc56f0d4-be96-403b-86f3-dd8d51ded871", label: "Autism" },
  ];
  const educationLevelOptions = [
    { id: "high_school", label: "High School" },
    { id: "associate", label: "Associate" },
    { id: "bachelor", label: "Bachelor" },
    { id: "master", label: "Master" },
    { id: "doctorate", label: "Doctorate" },
  ];
  const salaryRangeOptions = [
    { id: "5c5dfaf7-0240-4b6e-b814-e320712009e2", label: "6k - 9k" },
    { id: "99938c1d-e15d-4fda-98d0-8cb8f6f9aa3c", label: "10k - 15k" },
    { id: "d8d5e3d7-b96a-4a51-9238-0dbf7b254131", label: "16k - 20k" },
    { id: "dc1ea573-9646-45e2-a5eb-f32711eaecbb", label: "Above 20k" },
  ];

  // Handlers for UI selections:
  const handleWorkTermSelect = (term: "full_time" | "dayburg") => setSelectedWorkTerm(term);
  const toggleService = (id: string) =>
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  const handlePreferredAgeGroup = (id: string) => setPreferredAgeGroup(id);
  const handleNumberOfKidsPreferred = (id: string) => setNumberOfKidsPreferred(id);
  const toggleSpecialNeed = (id: string) =>
    setSelectedSpecialNeeds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  // Submit handler: perform upsert operations and then call onComplete
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Complete pressed");

    const client = createClient(); // Ensure you're using your initialized supabase client
    const nannyId = localStorage.getItem("nannyId");
    if (!nannyId) {
      console.error("No nanny ID found");
      return;
    }

    // Prepare data for nannies table
    const nannyData = {
      id: nannyId,
      // Convert empty string to null if needed
      education_level: educationLevel === "" ? null : educationLevel,
      salary_range_id: salaryRangeId === "" ? null : salaryRangeId,
      years_of_experience: yearsOfExperience, // already a number
      work_type: selectedWorkTerm === "" ? null : selectedWorkTerm,
      nanny_services: selectedServices,
      // Convert preferred kids count to number if needed; here we assume if empty, set to null
      preferred_kids_count: numberOfKidsPreferred === "" ? null : parseInt(numberOfKidsPreferred, 10),
      preferred_age_group: preferredAgeGroup === "" ? null : preferredAgeGroup,
    };

    // Upsert the main professional details into the nannies table
    const { error: nannyError } = await client
      .from("nannies")
      .upsert(nannyData, { onConflict: "id" });
    if (nannyError) {
      console.error("Error updating nanny details", nannyError);
      return;
    }

    // Now handle the many-to-many relationship for special needs.
    // Remove existing special needs for this nanny
    const { error: deleteError } = await client
      .from("_nanniesToSpecialNeeds")
      .delete()
      .eq("A", nannyId);
    if (deleteError) {
      console.error("Error clearing existing special needs", deleteError);
      return;
    }

    // Insert new rows for each selected special need
    const specialNeedsRows = selectedSpecialNeeds.map((specialNeedId) => ({
      A: nannyId,
      B: specialNeedId,
    }));
    const { error: insertError } = await client
      .from("_nanniesToSpecialNeeds")
      .insert(specialNeedsRows);
    if (insertError) {
      console.error("Error inserting special needs", insertError);
      return;
    }

    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%] max-h-[70%] md:max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Title and Progress Sections */}
          <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
            <div className="flex items-center mb-5 border-b justify-between">
              <h1 className="font-barlow font-semibold text-lg">Onboard New Nanny - Professional Info</h1>
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
                <span className="text-sm md:text-base font-barlow font-normal">Bio Information</span>
                <span className="text-sm md:text-base font-barlow font-normal">Personal Details</span>
                <span className="text-sm md:text-base font-barlow font-normal">Contact Information</span>
                <span className="text-sm md:text-base font-barlow font-normal">Professional Information</span>
              </div>
              <div className="w-full h-1 rounded-md bg-[#cccaca54]">
                <div className="h-full rounded-md bg-[#6000DA] w-[96%] md:w-[54%]"></div>
              </div>
            </div>
          </div>

          {/* Professional Details Form Fields */}
          <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto flex flex-col gap-6">
            {/* Education Level */}
            <div className="relative">
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 font-barlow">
                Highest Educational Level
              </label>
              <select
                id="education"
                value={educationLevel}
                onChange={(e) =>
                  setEducationLevel(e.target.value as "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "")
                }
                className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="">Select Level</option>
                {educationLevelOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Salary Range */}
            <div className="relative">
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 font-barlow">
                Salary Range
              </label>
              <select
                id="salary"
                value={salaryRangeId}
                onChange={(e) => setSalaryRangeId(e.target.value)}
                className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="">Select Salary Range</option>
                {salaryRangeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Years of Experience */}
            <div className="form-control">
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 font-barlow">
                Years of Experience
              </label>
              <input
                type="number"
                id="experience"
                placeholder="e.g. 3"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(parseInt(e.target.value, 10) || 0)}
                className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {/* Work Terms */}
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-barlow font-medium">Work Terms</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleWorkTermSelect("full_time")}
                  className={`px-4 py-3 text-xs rounded-[24px] ${
                    selectedWorkTerm === "full_time"
                      ? "border-[#6000DA] border-2 bg-[#6000DA12] text-[#6000DA]"
                      : "border border-gray-300 bg-white text-black"
                  }`}
                >
                  Fulltime
                </button>
                <button
                  type="button"
                  onClick={() => handleWorkTermSelect("dayburg")}
                  className={`px-4 py-3 text-xs rounded-[24px] ${
                    selectedWorkTerm === "dayburg"
                      ? "border-[#6000DA] border-2 bg-[#6000DA12] text-[#6000DA]"
                      : "border border-gray-300 bg-white text-black"
                  }`}
                >
                  Dayburgh
                </button>
              </div>
            </div>
            {/* Services Available */}
            <div className="mt-6">
              <p className="font-barlow font-semibold text-base">Services Available to Offer</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {servicesAvailableOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleService(option.id)}
                    className={`px-4 py-3 text-xs rounded-[24px] ${
                      selectedServices.includes(option.id)
                        ? "border-[#6000DA] border-2 bg-[#6000DA12] text-[#6000DA]"
                        : "border border-gray-300 bg-white text-black"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Preferred Age Group */}
            <div className="mt-6">
              <p className="font-barlow font-semibold text-base">Preferred Age Group</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {preferredAgeGroupOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePreferredAgeGroup(option.id)}
                    className={`px-4 py-3 text-xs rounded-[24px] ${
                      preferredAgeGroup === option.id
                        ? "border-[#6000DA] border-2 bg-[#6000DA12] text-[#6000DA]"
                        : "border border-gray-300 bg-white text-black"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Number of Kids Preferred */}
            <div className="mt-6">
              <p className="font-barlow font-semibold text-base">Number of Kids Preferred</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {numberOfKidsOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleNumberOfKidsPreferred(option.id)}
                    className={`px-4 py-3 text-xs rounded-[24px] ${
                      numberOfKidsPreferred === option.id
                        ? "border-[#6000DA] border-2 bg-[#6000DA12] text-[#6000DA]"
                        : "border border-gray-300 bg-white text-black"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Preferred Special Needs */}
            <div className="mt-6">
              <p className="font-barlow font-semibold text-base">Preferred Special Needs</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {preferredSpecialNeedsOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleSpecialNeed(option.id)}
                    className={`px-4 py-3 text-xs rounded-[24px] ${
                      selectedSpecialNeeds.includes(option.id)
                        ? "border-[#6000DA] border-2 bg-[#6000DA12] text-[#6000DA]"
                        : "border border-gray-300 bg-white text-black"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
            <div className="mt-5 flex justify-center md:justify-end items-center gap-3">
              <button type="button" onClick={onBack} className="px-8 py-3 bg-[#F5F5F5] rounded-lg">
                Back
              </button>
              <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
                Complete
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalModal;
