"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { professionalInfoSchema, ProfessionalInfoFormValues } from "@/hooks/nanny/nannySchema";
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

  // Local state for work term toggle
  const [selectedWorkTerm, setSelectedWorkTerm] = React.useState<"full_time" | "dayburg" | "">("");
  const currentWorkTerm = watch("work_terms");
  React.useEffect(() => {
    if (currentWorkTerm) setSelectedWorkTerm(currentWorkTerm);
  }, [currentWorkTerm]);

  const handleWorkTermSelect = (term: "full_time" | "dayburg") => {
    setSelectedWorkTerm(term);
    setValue("work_terms", term);
  };

  const onSubmit = async (data: ProfessionalInfoFormValues) => {
    try {
      // Retrieve saved data from previous steps using sessionStorage
      const bioData = JSON.parse(sessionStorage.getItem("nannyBioData") || "{}");
      const personalData = JSON.parse(sessionStorage.getItem("nannyPersonalData") || "{}");
      const contactData = JSON.parse(sessionStorage.getItem("nannyContactData") || "{}");

      // Combine all data
      const completeData = {
        ...bioData,
        ...personalData,
        ...contactData,
        ...data,
      };

      // Ensure user_id exists
      if (!completeData.user_id) {
        throw new Error("User ID is missing from the form data.");
      }

      const supabase = createClient();

      // --- Upload Profile Images (from Bio Data) to "profile_pictures" bucket ---
      const bioFiles: File[] = completeData.images || [];
      const profileImageUrls = await uploadImages(bioFiles, "profile_pictures");
      const avatarUrl = profileImageUrls[0];

      // --- Upload Personal ID Images (from Personal Data) to "nannies" bucket ---
      // (Assuming personalData may contain a field, e.g., id_images)
      const personalFiles: File[] = completeData.id_images || [];
      const idImageUrls = await uploadImages(personalFiles, "nannies");
      // For now, we'll log these URLs.
      console.log("Uploaded ID Image URLs:", idImageUrls);

      // Update the user_accounts record with avatar_url and other fields
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

      // Map the salary range label to its corresponding salary_range_id
      const { data: salaryData, error: salaryError } = await supabase
        .from("salary_ranges")
        .select("id")
        .eq("label", completeData.salary_range)
        .single();
      if (salaryError) throw salaryError;
      const salaryRangeId = salaryData.id;

      // Prepare the nanny record for insertion (note: phone is omitted here)
      const nannyRecord = {
        user_id: completeData.user_id,  // Include the foreign key linking to user_accounts
        location: completeData.location,
        is_available: true,
        rating: 5.0, // default rating
        work_type: completeData.work_terms,
        salary_range_id: salaryRangeId,
        nationality: completeData.nationality,
        religion: completeData.religion,
        tribe: completeData.tribe,
        // Other fields as necessary
      };
      

      // Insert the nanny record into the nannies table
      const { error: insertError } = await supabase
        .from("nannies")
        .insert(nannyRecord);
      if (insertError) throw insertError;

      toast.success("Nanny created successfully!");
      sessionStorage.removeItem("nannyBioData");
      sessionStorage.removeItem("nannyPersonalData");
      sessionStorage.removeItem("nannyContactData");
      router.push("/admin/nannies");
    } catch (error: any) {
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

        {/* Professional Info Form Fields */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Section */}
            <div className="flex flex-col gap-3 w-full">
              <p className="font-barlow font-semibold text-base">Professional Information</p>
              <div className="mt-4 relative">
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
              </div>

              {/* Work Terms Toggle */}
              <div className="flex flex-col gap-2 mt-3">
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

            {/* Right Section */}
            <div className="flex flex-col gap-3 w-full">
              <p className="invisible font-barlow font-semibold text-base">Professional Information</p>
              <div className="mt-4 relative">
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
