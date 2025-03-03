"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

// Define a Zod enum for contact person relationship.
const contactRelationshipEnum = z.enum([
  "spouse",
  "parent",
  "sibling",
  "child",
  "friend",
  "cousin",
  "other",
]);

// Define the schema for contact info.
const contactSchema = z.object({
  location: z.string().min(1, "Location is required"),
  phone: z.string().min(1, "Phone number is required"),
  cp_name: z.string().min(1, "Contact person's name is required"),
  cp_phone: z.string().min(1, "Contact person's phone is required"),
  cp_relationship: contactRelationshipEnum,
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface EditContactModalNannyProps {
  nannyId: string;
  onClose: () => void;
  onProceed: () => void;
}

const EditContactModalNanny: React.FC<EditContactModalNannyProps> = ({
  nannyId,
  onClose,
  onProceed,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });
    
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const client = createClient();
    const fetchData = async () => {
      setLoading(true);

      // Fetch nanny record from the nannies table (to get location and user_id).
      const { data: nannyData, error: nannyError } = await client
        .from("nannies")
        .select("location, user_id")
        .eq("id", nannyId)
        .maybeSingle();

      if (nannyError) {
        toast.error("Error fetching nanny data.");
        console.error(nannyError);
        setLoading(false);
        return;
      }
      if (!nannyData) {
        toast.error("Nanny data not found.");
        setLoading(false);
        return;
      }
      setUserId(nannyData.user_id);

      // Fetch phone number from user_accounts table using user_id.
      let phoneValue = "";
      if (nannyData.user_id) {
        const { data: userData, error: userError } = await client
          .from("user_accounts")
          .select("phone")
          .eq("id", nannyData.user_id)
          .maybeSingle();
        if (userError) {
          toast.error("Error fetching user data.");
          console.error(userError);
        } else if (userData) {
          phoneValue = userData.phone || "";
        }
      }

      // Fetch contact person details from contact_persons table using nanny_id.
      const { data: cpData, error: cpError } = await client
        .from("contact_persons")
        .select("name, phone, relationship")
        .eq("nanny_id", nannyId)
        .maybeSingle();

      if (cpError) {
        toast.error("Error fetching contact person data.");
        console.error(cpError);
      }

      // Pre-populate the form with fetched data.
      reset({
        location: nannyData.location || "",
        phone: phoneValue,
        cp_name: cpData?.name || "",
        cp_phone: cpData?.phone || "",
        cp_relationship: cpData?.relationship || "other",
      });
      setLoading(false);
    };
    fetchData();
  }, [nannyId, reset]);

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    const client = createClient();

    // Update the nanny's location in the nannies table.
    const { error: nannyUpdateError } = await client
      .from("nannies")
      .update({ location: data.location })
      .eq("id", nannyId);
    if (nannyUpdateError) {
      toast.error("Error updating location.");
      console.error(nannyUpdateError);
      setLoading(false);
      return;
    }

    // Update the phone number in the user_accounts table.
    if (userId) {
      const { error: userUpdateError } = await client
        .from("user_accounts")
        .update({ phone: data.phone })
        .eq("id", userId);
      if (userUpdateError) {
        toast.error("Error updating phone number.");
        console.error(userUpdateError);
        setLoading(false);
        return;
      }
    } else {
      toast.error("User ID not found.");
      setLoading(false);
      return;
    }

    // Upsert the contact person info in the contact_persons table.
    // Note: cp_relationship is now typed as one of the allowed literal values.
    const { error: cpUpdateError } = await client
      .from("contact_persons")
      .upsert({
        name: data.cp_name,
        phone: data.cp_phone,
        relationship: data.cp_relationship,
        nanny_id: nannyId,
      })
      .eq("nanny_id", nannyId);
    if (cpUpdateError) {
      toast.error("Error updating contact person information.");
      console.error(cpUpdateError);
      setLoading(false);
      return;
    }

    toast.success("Contact information updated successfully!");
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
              <h1 className="font-barlow font-semibold text-lg">Edit Nanny Contact Info</h1>
              <button type="button" onClick={onClose} className="p-2 bg-[#FAFAFA] rounded-full">
                <Image src="/nannies-assets/close.svg" alt="Close Icon" width={20} height={20} />
              </button>
            </div>
             {/* Navigation / Progress Section */}
             <div className="flex flex-col gap-4 md:gap-7 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm md:text-base font-barlow font-normal">Bio Information</span>
                <span className="text-sm md:text-base font-barlow font-normal">Personal Details</span>
                <span className="text-sm md:text-base font-barlow font-normal">Contact Information</span>
                <span className="text-sm md:text-base font-barlow font-normal">Professional Information</span>
              </div>
              <div className="w-full h-1 rounded-md bg-[#cccaca54]">
                <div className="h-full rounded-md bg-[#6000DA] w-[21%] md:w-[31%]"></div>
              </div>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4">
                <p className="font-barlow font-semibold text-base">Location</p>
                <input
                  type="text"
                  placeholder="Enter Location"
                  {...register("location")}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location.message}</p>
                )}
              </div>
              <div className="mt-4">
                <p className="font-barlow font-semibold text-base">Phone Number</p>
                <input
                  type="text"
                  placeholder="Enter Phone Number"
                  {...register("phone")}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>
              <div className="mt-4">
                <p className="font-barlow font-semibold text-base">Contact Person Information</p>
                <div className="mt-2">
                  <label htmlFor="cp_name" className="block text-sm font-medium text-gray-700 font-barlow">
                    Name
                  </label>
                  <input
                    type="text"
                    id="cp_name"
                    placeholder="Enter Contact Person's Name"
                    {...register("cp_name")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.cp_name && (
                    <p className="text-red-500 text-sm">{errors.cp_name.message}</p>
                  )}
                </div>
                <div className="mt-2">
                  <label htmlFor="cp_phone" className="block text-sm font-medium text-gray-700 font-barlow">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="cp_phone"
                    placeholder="Enter Contact Person's Phone"
                    {...register("cp_phone")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.cp_phone && (
                    <p className="text-red-500 text-sm">{errors.cp_phone.message}</p>
                  )}
                </div>
                <div className="mt-2">
                  <label htmlFor="cp_relationship" className="block text-sm font-medium text-gray-700 font-barlow">
                    Relationship
                  </label>
                  <select
                    id="cp_relationship"
                    {...register("cp_relationship")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="cousin">Cousin</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.cp_relationship && (
                    <p className="text-red-500 text-sm">{errors.cp_relationship.message}</p>
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

export default EditContactModalNanny;
