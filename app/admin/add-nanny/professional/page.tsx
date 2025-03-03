"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  professionalInfoSchema,
  ProfessionalInfoFormValues,
} from "@/hooks/nanny/nannySchema";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { uploadImages } from "@/utils/nannies/uploadImages";

const ProfessionalInfoPage: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfessionalInfoFormValues>({
    resolver: zodResolver(professionalInfoSchema),
  });

  // Work term toggle state
  const [selectedWorkTerm, setSelectedWorkTerm] = useState<"full_time" | "dayburg" | "">("");
  const currentWorkTerm = watch("work_terms");
  useEffect(() => {
    if (currentWorkTerm) setSelectedWorkTerm(currentWorkTerm);
  }, [currentWorkTerm]);
  const handleWorkTermSelect = (term: "full_time" | "dayburg") => {
    setSelectedWorkTerm(term);
    setValue("work_terms", term);
  };

  const onSubmit = async (data: ProfessionalInfoFormValues) => {
    try {
      // Retrieve saved data from previous steps
      const bioData = JSON.parse(sessionStorage.getItem("nannyBioData") || "{}");
      const personalData = JSON.parse(sessionStorage.getItem("nannyPersonalData") || "{}");
      const contactData = JSON.parse(sessionStorage.getItem("nannyContactData") || "{}");

      // Merge data from all steps with the current form data
      const completeData = {
        ...bioData,
        ...personalData,
        ...contactData,
        ...data,
      };

      if (!completeData.user_id) {
        throw new Error("User ID is missing from the form data.");
      }

      const supabase = createClient();

      // Upload images for bio and personal info
      const bioFiles: File[] = completeData.images || [];
      const profileImageUrls = await uploadImages(bioFiles, "profile_pictures");
      const avatarUrl = profileImageUrls[0];

      const personalFiles: File[] = completeData.id_images || [];
      const idImageUrls = await uploadImages(personalFiles, "nannies");
      console.log("Uploaded ID Image URLs:", idImageUrls);

      // Update user_accounts record with avatar, full name, and phone
      const { error: updateError } = await supabase
        .from("user_accounts")
        .update({
          avatar_url: avatarUrl,
          full_name: completeData.full_name,
          phone: completeData.phone,
        })
        .eq("id", completeData.user_id);
      if (updateError) {
        console.error("Error updating user_accounts:", updateError);
        throw updateError;
      }

      // Map salary range label to salary_range_id
      const { data: salaryData, error: salaryError } = await supabase
        .from("salary_ranges")
        .select("id")
        .eq("label", completeData.salary_range)
        .single();
      if (salaryError) throw salaryError;
      const salaryRangeId = salaryData.id;

      // Prepare the nanny record payload
      const nannyRecord = {
        user_id: completeData.user_id,
        location: completeData.location,
        is_available: true,
        rating: 5.0,
        work_type: completeData.work_terms,
        salary_range_id: salaryRangeId, // Fetched from the salary_ranges table
        nationality: completeData.nationality,
        religion: completeData.religion,
        tribe_id: completeData.tribe, // Ensure this matches your schema field name
      };

      // Check if a nanny record for this user already exists
      const { data: existingNanny } = await supabase
        .from("nannies")
        .select("id")
        .eq("user_id", completeData.user_id)
        .maybeSingle();

      let nannyId;
      if (existingNanny) {
        const { data: updatedNanny, error: updateNannyError } = await supabase
          .from("nannies")
          .update(nannyRecord)
          .eq("user_id", completeData.user_id)
          .select();
        if (updateNannyError) throw updateNannyError;
        nannyId = updatedNanny[0].id;
      } else {
        const { data: insertedNannies, error: insertError } = await supabase
          .from("nannies")
          .insert(nannyRecord)
          .select();
        if (insertError) throw insertError;
        nannyId = insertedNannies[0].id;
      }

      // Insert contact persons into the contact_persons table
      if (completeData.contacts && completeData.contacts.length > 0) {
        for (const contact of completeData.contacts) {
          const contactPayload = {
            name: contact.name,
            relationship: contact.relationship,
            nanny_id: nannyId,
            phone: contact.phone || "0714224356", // Provide a default if necessary
          };

          const { error: contactInsertError } = await supabase
            .from("contact_persons")
            .insert(contactPayload);
          if (contactInsertError) {
            console.error("Error inserting contact person:", contactInsertError);
            throw contactInsertError;
          }
        }
      }

      toast.success("Nanny created successfully!");
      // Clean up session storage after successful submission
      sessionStorage.removeItem("nannyBioData");
      sessionStorage.removeItem("nannyPersonalData");
      sessionStorage.removeItem("nannyContactData");
      router.push("/admin/nannies");
    } catch (error: unknown) {
      console.error("Error creating nanny:", error);
      toast.error("Error creating nanny");
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-6">
        {/* Title and Progress Sections */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
          <div className="flex items-center mb-5 border-b justify-between">
            <h1 className="font-barlow font-semibold text-lg">Onboard New Nanny</h1>
            <button
              type="button"
              onClick={() => router.push("/admin/nannies")}
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
            {/* Progress Bar */}
            <div className="w-full h-1 rounded-md bg-[#cccaca54]">
              <div className="h-full rounded-md bg-[#6000DA] w-[96%] md:w-[54%]"></div>
            </div>
          </div>
        </div>

        {/* Main Form Sections */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto flex flex-col md:flex-row gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            {/* Highest Educational Level */}
            <div className="relative">
              <label htmlFor="Education" className="block text-sm font-medium text-gray-700 font-barlow">
                Highest Educational Level
              </label>
              <select
                id="Education"
                {...register("highest_education")}
                className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="">Select Level</option>
                <option value="high_school">High School</option>
                <option value="associate">Associate</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="doctorate">Doctorate</option>
              </select>
              {errors.highest_education && (
                <p className="text-red-500 text-sm mt-1">{errors.highest_education.message}</p>
              )}
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
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            {/* Salary Range */}
            <div className="relative">
              <label htmlFor="Salary" className="block text-sm font-medium text-gray-700 font-barlow">
                Salary Range
              </label>
              <select
                id="Salary"
                {...register("salary_range")}
                className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="">Select Range</option>
                <option value="6k - 9k">6k - 9k</option>
                <option value="10k - 15k">10k - 15k</option>
                <option value="16k - 20k">16k - 20k</option>
                <option value="Above 20k">Above 20k</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
          <div className="mt-5 flex justify-center md:justify-end items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/nannies")}
              className="px-8 py-3 bg-[#F5F5F5] rounded-lg"
            >
              Discard
            </button>
            <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
              Complete
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalInfoPage;
