"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

// Define a Zod enum for religion.
const religionEnum = z.enum(["christian", "islam", "hindu", "pagan", "non_religious"]);

// Define the schema for personal details.
const personalSchema = z.object({
  nationality: z.string().min(1, "Nationality is required"),
  religion: religionEnum, // now only allowed values can be used.
  tribe_id: z.string().min(1, "Tribe selection is required"),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

interface EditPersonalModalNannyProps {
  nannyId: string;
  onClose: () => void;
  onProceed: () => void;
}

const EditPersonalModalNanny: React.FC<EditPersonalModalNannyProps> = ({
  nannyId,
  onClose,
  onProceed,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [tribes, setTribes] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const client = createClient();
    const fetchData = async () => {
      setLoading(true);

      // Fetch nanny record (nationality, religion, tribe_id) from nannies table.
      const { data: nannyData, error: nannyError } = await client
        .from("nannies")
        .select("nationality, religion, tribe_id")
        .eq("id", nannyId)
        .maybeSingle();

      if (nannyError) {
        toast.error("Error fetching nanny data.");
        console.error(nannyError);
        setLoading(false);
        return;
      }

      // Fetch tribes options from tribes table.
      const { data: tribesData, error: tribesError } = await client
        .from("tribes")
        .select("id, label");

      if (tribesError) {
        toast.error("Error fetching tribes.");
        console.error(tribesError);
        setLoading(false);
        return;
      }

      setTribes(tribesData || []);

      if (nannyData) {
        reset({
          nationality: nannyData.nationality || "",
          religion: nannyData.religion || "christian", // Default value if empty.
          tribe_id: nannyData.tribe_id || "",
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [nannyId, reset]);

  // Handle form submission to update personal details.
  const onSubmit = async (data: PersonalFormValues) => {
    setLoading(true);
    const client = createClient();

    // Update the nannies table with the new personal details.
    const { error } = await client
      .from("nannies")
      .update({
        nationality: data.nationality,
        religion: data.religion,
        tribe_id: data.tribe_id,
      })
      .eq("id", nannyId);

    if (error) {
      toast.error("Error updating personal information.");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("Personal information updated successfully!");
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
          <>
            {/* Title Section */}
            <div className="flex items-center mb-5 border-b justify-between">
              <h1 className="font-barlow font-semibold text-lg">Edit Nanny Personal Info</h1>
              <button type="button" onClick={onClose} className="p-2 bg-[#FAFAFA] rounded-full">
                <Image src="/nannies-assets/close.svg" alt="Close Icon" width={20} height={20} />
              </button>
            </div>
            {/* Progress Indicator */}
            <div className="flex flex-col gap-4 md:gap-7 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm md:text-base font-barlow font-normal">Bio Information</span>
                <span className="text-sm md:text-base font-barlow font-normal">Personal Details</span>
                <span className="text-sm md:text-base font-barlow font-normal">Contact Information</span>
                <span className="text-sm md:text-base font-barlow font-normal">Professional Information</span>
              </div>
              <div className="w-full h-1 rounded-md bg-[#cccaca54]">
                <div className="h-full rounded-md bg-[#6000DA] w-[42%] md:w-[20%]"></div>
              </div>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <p className="font-barlow font-semibold text-base mt-4">Personal Details</p>
                <div className="mt-4">
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 font-barlow">
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    placeholder="Enter Nationality"
                    {...register("nationality")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full md:w-1/2  focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.nationality && (
                    <p className="text-red-500 text-sm">{errors.nationality.message}</p>
                  )}
                </div>
                <div className="mt-4">
                  <label htmlFor="religion" className="block text-sm font-medium text-gray-700 font-barlow">
                    Religion
                  </label>
                  <select
                    id="religion"
                    {...register("religion")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="">Select Religion</option>
                    <option value="christian">Christian</option>
                    <option value="islam">Islam</option>
                    <option value="hindu">Hindu</option>
                    <option value="pagan">Pagan</option>
                    <option value="non_religious">Non Religious</option>
                  </select>
                  {errors.religion && (
                    <p className="text-red-500 text-sm">{errors.religion.message}</p>
                  )}
                </div>
                <div className="mt-4 relative">
                  <label htmlFor="tribe_id" className="block text-sm font-medium text-gray-700 font-barlow">
                    Tribe
                  </label>
                  <select
                    id="tribe_id"
                    {...register("tribe_id")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="">Select Tribe</option>
                    {tribes.map((tribe) => (
                      <option key={tribe.id} value={tribe.id}>
                        {tribe.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-[65%] transform -translate-y-1/2 pointer-events-none text-gray-500" />
                  {errors.tribe_id && (
                    <p className="text-red-500 text-sm">{errors.tribe_id.message}</p>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-center md:justify-end items-center gap-3 mt-5">
                <button type="button" onClick={onClose} className="px-8 py-3 bg-[#F5F5F5] rounded-lg">
                  Discard
                </button>
                <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
                  Proceed
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EditPersonalModalNanny;
