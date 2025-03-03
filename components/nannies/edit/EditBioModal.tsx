"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

// Define a schema for the nanny bio information.
const nannyBioSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  photo: z.any().optional(), // Could be a File or a URL string.
});

type NannyBioFormValues = z.infer<typeof nannyBioSchema>;

interface EditBioModalNannyProps {
  nannyId: string;
  onClose: () => void;
  onProceed: () => void;
}

const EditBioModalNanny: React.FC<EditBioModalNannyProps> = ({ nannyId, onClose, onProceed }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<NannyBioFormValues>({
    resolver: zodResolver(nannyBioSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const photo = watch("photo");

  // Fetch the nanny row and then the corresponding user data.
  const fetchUserData = async () => {
    setLoading(true);
    const client = createClient();

    // Fetch nanny record using nannyId.
    const { data: nannyData, error: nannyError } = await client
      .from("nannies")
      .select("user_id")
      .eq("id", nannyId)
      .maybeSingle();

    if (nannyError) {
      console.error("Error fetching nanny data:", nannyError);
      toast.error("Error fetching nanny data.");
      setLoading(false);
      return;
    }

    if (!nannyData || !nannyData.user_id) {
      toast.error("No user found for this nanny.");
      setLoading(false);
      return;
    }

    const userId = nannyData.user_id;

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
      // Pre-populate the form with fetched values.
      reset({
        full_name: data.full_name || "",
        photo: typeof data.avatar_url === "string" ? data.avatar_url : undefined,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, [nannyId]);

  // Handle file selection for photo upload.
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

  // Update the user_accounts record on form submission.
  const onSubmit = async (data: NannyBioFormValues) => {
    setLoading(true);
    const client = createClient();

    // Re-fetch nanny row to get user_id.
    const { data: nannyData, error: nannyError } = await client
      .from("nannies")
      .select("user_id")
      .eq("id", nannyId)
      .maybeSingle();

    if (nannyError) {
      console.error("Error fetching nanny data:", nannyError);
      toast.error("Error fetching nanny data.");
      setLoading(false);
      return;
    }

    if (!nannyData || !nannyData.user_id) {
      toast.error("No user found for this nanny.");
      setLoading(false);
      return;
    }

    const userId = nannyData.user_id;
    // NOTE: If the photo is a File, you should handle file upload and then update with its URL.
    const photoValue = data.photo ? data.photo : null;

    const { error } = await client
      .from("user_accounts")
      .upsert(
        {
          id: userId,
          full_name: data.full_name,
          avatar_url: photoValue,
          role: "nanny", // Ensure this matches your allowed enum values.
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
    onProceed();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[75%] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Title Section */}
            <div className="flex items-center mb-5 border-b justify-between">
              <h1 className="font-barlow font-semibold text-lg">Edit Nanny Professional Info</h1>
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
                <div className="h-full rounded-md bg-[#6000DA] w-[21%] md:w-[10%]"></div>
              </div>
            </div>
            {/* Bio Information UI */}
            <div className="mt-4">
              <p className="mb-2 font-barlow text-base font-semibold">Edit Bio Information</p>
              <label htmlFor="full_name" className="block font-barlow text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                placeholder="Enter full name"
                {...register("full_name")}
                className="mt-1 p-2 border border-gray-300 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
            </div>
            {/* Profile Photo UI */}
            <div className="mt-5">
              <p className="font-barlow text-sm">Edit Profile Photo</p>
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
              </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button type="button" className="px-8 py-3 bg-[#F5F5F5] rounded-lg" onClick={onClose}>
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

export default EditBioModalNanny;
