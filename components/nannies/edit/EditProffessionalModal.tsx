"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

interface ProfessionalInfoModalProps {
  nannyId: string;
  onClose: () => void;
  onProceed: () => void;
}

interface SalaryRangeOption {
  id: string;
  label: string;
}

// Define union types for the fields.
type EducationLevel = "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "";
type WorkType = "full_time" | "dayburg" | "";
type NannyService = "childcare" | "elderly" | "special_needs";
type PreferredAgeGroup = "zero_to_one" | "one_to_three" | "three_and_above";
type PreferredKidsCount = "one_to_two" | "one_to_five" | "more_than_five";

const ProfessionalInfoModal: React.FC<ProfessionalInfoModalProps> = ({
  nannyId,
  onClose,
  onProceed,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  // State for fields from the nannies table.
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("");
  const [location, setLocation] = useState<string>("");
  const [selectedWorkTerm, setSelectedWorkTerm] = useState<WorkType>("");
  const [selectedServices, setSelectedServices] = useState<NannyService[]>([]);
  // Using null as absence of a selection.
  const [preferredAgeGroup, setPreferredAgeGroup] = useState<PreferredAgeGroup | null>(null);
  const [numberOfKidsPreferred, setNumberOfKidsPreferred] = useState<PreferredKidsCount | null>(null);
  const [salaryRangeId, setSalaryRangeId] = useState<string>("");
  // New state for years of experience.
  const [yearsOfExperience, setYearsOfExperience] = useState<number | null>(null);

  // Salary range options from the salary_ranges table.
  const [salaryRangeOptions, setSalaryRangeOptions] = useState<SalaryRangeOption[]>([]);

  // Options arrays for toggles (values now match the unions)
  const servicesAvailableOptions: { id: NannyService; label: string }[] = [
    { id: "childcare", label: "Child Care" },
    { id: "elderly", label: "Elderly Care" },
    { id: "special_needs", label: "Special Needs Care" },
  ];
  const preferredAgeGroupOptions: { id: PreferredAgeGroup; label: string }[] = [
    { id: "zero_to_one", label: "0-1 year" },
    { id: "one_to_three", label: "1-3 years" },
    { id: "three_and_above", label: "3 years and above" },
  ];
  const numberOfKidsOptions: { id: PreferredKidsCount; label: string }[] = [
    { id: "one_to_two", label: "1-2 kids" },
    { id: "one_to_five", label: "1-5 kids" },
    { id: "more_than_five", label: "More than 5" },
  ];

  // Handlers for toggles.
  const handleWorkTermSelect = (term: WorkType) => setSelectedWorkTerm(term);
  const toggleService = (id: NannyService) =>
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  const handlePreferredAgeGroup = (id: PreferredAgeGroup) => setPreferredAgeGroup(id);
  const handleNumberOfKidsPreferred = (id: PreferredKidsCount) => setNumberOfKidsPreferred(id);

  // Fetch initial data from nannies and salary_ranges tables.
  useEffect(() => {
    const client = createClient();
    const fetchData = async () => {
      setLoading(true);
      // Fetch professional info from nannies table.
      const { data: nannyData, error: nannyError } = await client
        .from("nannies")
        .select(
          "education_level, location, work_type, nanny_services, preferred_age_group, preferred_kids_count, salary_range_id, years_of_experience"
        )
        .eq("id", nannyId)
        .maybeSingle();

      if (nannyError) {
        toast.error("Error fetching professional info.");
        console.error(nannyError);
        setLoading(false);
        return;
      }
      if (nannyData) {
        setEducationLevel((nannyData.education_level as EducationLevel) || "");
        setLocation(nannyData.location || "");
        setSelectedWorkTerm((nannyData.work_type as WorkType) || "");
        setSelectedServices((nannyData.nanny_services as NannyService[]) || []);
        // For array fields, extract the first element or default to null.
        if (Array.isArray(nannyData.preferred_age_group) && nannyData.preferred_age_group.length > 0) {
          setPreferredAgeGroup(nannyData.preferred_age_group[0] as PreferredAgeGroup);
        } else {
          setPreferredAgeGroup(null);
        }
        if (Array.isArray(nannyData.preferred_kids_count) && nannyData.preferred_kids_count.length > 0) {
          setNumberOfKidsPreferred(nannyData.preferred_kids_count[0] as PreferredKidsCount);
        } else {
          setNumberOfKidsPreferred(null);
        }
        setSalaryRangeId(nannyData.salary_range_id || "");
        // New: Set years of experience. If not provided, set to null.
        setYearsOfExperience(nannyData.years_of_experience ?? null);
      }

      // Fetch salary range options.
      const { data: salaryData, error: salaryError } = await client
        .from("salary_ranges")
        .select("id, label");

      if (salaryError) {
        toast.error("Error fetching salary range options.");
        console.error(salaryError);
        setLoading(false);
        return;
      }
      setSalaryRangeOptions(salaryData || []);
      setLoading(false);
    };

    fetchData();
  }, [nannyId]);

  // Submit handler to update professional information.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const client = createClient();

    // Build update payload.
    const updatePayload = {
      education_level: educationLevel === "" ? null : educationLevel,
      location: location === "" ? null : location,
      work_type: selectedWorkTerm === "" ? null : selectedWorkTerm,
      nanny_services: selectedServices,
      preferred_age_group: preferredAgeGroup ? [preferredAgeGroup] : null, // stored as array
      preferred_kids_count: numberOfKidsPreferred ? [numberOfKidsPreferred] : null, // stored as array
      salary_range_id: salaryRangeId === "" ? null : salaryRangeId,
      years_of_experience: yearsOfExperience === null ? null : yearsOfExperience,
    };

    const { error } = await client.from("nannies").update(updatePayload).eq("id", nannyId);

    if (error) {
      toast.error("Error updating professional information.");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("Professional information updated successfully!");
    setLoading(false);
    onProceed();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[75%]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Title and Progress Sections */}
            <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
              <div className="flex items-center mb-5 border-b justify-between">
                <h1 className="font-barlow font-semibold text-lg">Edit Nanny Professional Info</h1>
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
            {/* Main Form Sections */}
            <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto flex flex-col md:flex-row gap-6">
              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-6 w-full md:w-1/2">
                {/* Highest Education Level */}
                <div className="relative">
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 font-barlow">
                    Highest Educational Level
                  </label>
                  <select
                    id="education"
                    value={educationLevel}
                    onChange={(e) =>
                      setEducationLevel(
                        e.target.value as "high_school" | "associate" | "bachelor" | "master" | "doctorate" | ""
                      )
                    }
                    className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="">Select Level</option>
                    <option value="high_school">High School</option>
                    <option value="associate">Associate</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="doctorate">Doctorate</option>
                  </select>
                </div>
                {/* Location */}
                <div className="mt-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 font-barlow">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter Location"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {/* Years of Experience */}
                <div className="mt-4">
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 font-barlow">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="experience"
                    value={yearsOfExperience !== null ? yearsOfExperience : ""}
                    onChange={(e) =>
                      setYearsOfExperience(e.target.value === "" ? null : Number(e.target.value))
                    }
                    placeholder="Enter Years of Experience"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {/* Work Terms Toggle */}
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
              </div>
              {/* RIGHT COLUMN */}
              <div className="flex flex-col gap-6 w-full md:w-1/2">
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
                    <option value="">Select Range</option>
                    {salaryRangeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
              </div>
            </div>
            {/* Action Buttons */}
            <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
              <div className="mt-5 flex justify-center md:justify-end items-center gap-3">
                <button type="button" onClick={onClose} className="px-8 py-3 bg-[#F5F5F5] rounded-lg">
                  Discard
                </button>
                <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
                  Complete
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInfoModal;
