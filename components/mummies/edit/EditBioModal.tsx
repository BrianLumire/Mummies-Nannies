"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

// Define a schema for the Mummy bio information.
const mummyBioSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  photo: z.any().optional(),
});

type MummyBioFormValues = z.infer<typeof mummyBioSchema>;

interface EditBioModalProps {
  mammiesId: string; // This is the id from the mammies table (from route params)
  onClose: () => void;
  onNext: () => void;
}

const EditBioModal: React.FC<EditBioModalProps> = ({ mammiesId, onClose, onNext }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MummyBioFormValues>({
    resolver: zodResolver(mummyBioSchema),
  });

  // Watch for the profile photo.
  const photo = watch("photo");

  // Loading state for fetching/submitting data.
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the user data from user_accounts via the mammies table.
  const fetchUserData = async () => {
    setLoading(true);
    const client = createClient();

    // First, fetch the mammies row to get the associated user_id.
    const { data: mammiesData, error: mammiesError } = await client
      .from("mammies")
      .select("user_id")
      .eq("id", mammiesId)
      .maybeSingle();

    if (mammiesError) {
      console.error("Error fetching mammies data:", mammiesError);
      toast.error("Error fetching mammies data.");
      setLoading(false);
      return;
    }

    if (!mammiesData || !mammiesData.user_id) {
      toast.error("No user found for this mummy.");
      setLoading(false);
      return;
    }

    const userId = mammiesData.user_id;

    // Now fetch the user_accounts record using the user_id.
    const { data, error } = await client
      .from("user_accounts")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data.");
    } else if (data) {
      // Map database fields to the form fields.
      reset({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone || "",
        photo: typeof data.avatar_url === "string" ? data.avatar_url : undefined,
      });
    }
    setLoading(false);
  };

  // Fetch user data on modal mount.
  useEffect(() => {
    fetchUserData();
  }, [reset, mammiesId]);

  // Handle form submission: update the user_accounts record using the user_id.
  const onSubmit = async (data: MummyBioFormValues) => {
    setLoading(true);
    const client = createClient();

    // First, fetch the mammies row to get the user_id.
    const { data: mammiesData, error: mammiesError } = await client
      .from("mammies")
      .select("user_id")
      .eq("id", mammiesId)
      .maybeSingle();

    if (mammiesError) {
      console.error("Error fetching mammies data:", mammiesError);
      toast.error("Error fetching mammies data.");
      setLoading(false);
      return;
    }

    if (!mammiesData || !mammiesData.user_id) {
      toast.error("No user found for this mummy.");
      setLoading(false);
      return;
    }

    const userId = mammiesData.user_id;

    // NOTE: If 'photo' is a File, you should handle file upload before updating.
    const photoValue = data.photo ? data.photo : null;

    // Update the record in the user_accounts table using userId.
    const { error } = await client
      .from("user_accounts")
      .upsert(
        {
          id: userId,                // Use the fetched user_id.
          full_name: data.full_name,
          email: data.email,
          phone: data.phone_number,
          avatar_url: photoValue,
          role: "mammy",             // Must match allowed enum values.
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Error updating user data:", error);
      toast.error("Error updating bio information.");
      setLoading(false);
      return;
    }

    toast.success("Bio information updated successfully!");
    setLoading(false);
    onNext();
  };

  // Handle photo file selection.
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setValue("photo", files[0]);
    }
  };

  // Remove the selected photo.
  const removePhoto = () => {
    setValue("photo", undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Title & Progress Section */}
            <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
              <div className="flex items-center mb-5 border-b justify-between">
                <h1 className="font-barlow font-semibold text-lg">Edit Mummy</h1>
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
                  {/* Filled width represents the current step (20% for step 1 of 5) */}
                  <div className="h-full rounded-md bg-[#6000DA] w-[20%]"></div>
                </div>
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
              <h2 className="mb-4 font-barlow text-lg font-semibold">Edit Bio Information</h2>
              {/* Full Name */}
              <div className="mb-5">
                <label htmlFor="full_name" className="block font-barlow text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  placeholder="Enter name"
                  {...register("full_name")}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
              </div>
              {/* Email & Phone Number */}
              <div className="mb-5 flex flex-col md:flex-row md:gap-4">
                <div className="w-full md:w-1/2">
                  <label htmlFor="email" className="block font-barlow text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter email"
                    {...register("email")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="phone_number" className="block font-barlow text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone_number"
                    placeholder="Enter phone number"
                    {...register("phone_number")}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number.message}</p>}
                </div>
              </div>
              {/* Profile Photo Upload */}
              <div className="mb-5">
                <p className="font-barlow text-sm">Add Profile Photo</p>
                <div className="mt-3">
                  <div className="relative border-dotted border-2 w-full md:w-1/4 h-40 border-gray-300 shadow-md rounded-lg p-1 flex flex-col gap-2 items-center justify-center">
                    {photo ? (
                      <>
                        {photo instanceof File ? (
                          <Image
                            src={URL.createObjectURL(photo)}
                            alt="Photo Preview"
                            className="object-cover rounded-lg w-full h-full"
                            width={100}
                            height={100}
                          />
                        ) : typeof photo === "string" && photo.startsWith("http") ? (
                          <Image
                            src={photo}
                            alt="Photo Preview"
                            className="object-cover rounded-lg w-full h-full"
                            width={100}
                            height={100}
                          />
                        ) : null}
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute bottom-2 right-2 p-2 flex items-center justify-center bg-[#cecece] rounded-full"
                        >
                          <Image src="/nannies-assets/delete.svg" alt="Delete Photo" width={25} height={25} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => document.getElementById("photo-upload")?.click()}
                          className="p-2 flex items-center justify-center bg-[#6000DA12] rounded-full"
                        >
                          <Image src="/nannies-assets/add-photo.svg" alt="Add Photo Icon" width={25} height={25} />
                        </button>
                        <span className="font-barlow text-xs">Add Photo</span>
                        <span className="font-barlow text-xs text-gray-500">Attach PNG/JPG (max size 3mb)</span>
                      </>
                    )}
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {errors.photo && <p className="text-red-500 text-sm">{errors.photo.message as string}</p>}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-center md:justify-end gap-3">
                <button type="button" className="px-8 py-3 bg-[#F5F5F5] rounded-lg" onClick={onClose}>
                  Discard
                </button>
                <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
                  Proceed
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBioModal;
