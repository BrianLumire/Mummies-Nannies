"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

// Define a schema for the Nanny bio information.
const nannyBioSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  // Profile photo is optional.
  photo: z.any().optional(),
});
type NannyBioFormValues = z.infer<typeof nannyBioSchema>;

interface BioModalProps {
  onNext: () => void;
  onClose: () => void;
}

const BioModal: React.FC<BioModalProps> = ({ onNext, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NannyBioFormValues>({
    resolver: zodResolver(nannyBioSchema),
  });
  const [submitting, setSubmitting] = useState(false);
  // Manage multiple photos – an array of 4 items.
  const [photos, setPhotos] = useState<(string | File | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  const photo = photos[0]; // We'll use the first photo for avatar_url.

  // Handle file selection for a given photo container.
  const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[index] = files[0];
        return newPhotos;
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = undefined;
      return newPhotos;
    });
  };

  // Fetch existing user data to repopulate the form.
  const fetchUserData = async () => {
    const client = createClient();
    const nannyUserId = localStorage.getItem("nannyUserId");
    if (!nannyUserId) return;
    const { data, error } = await client
      .from("user_accounts")
      .select("*")
      .eq("id", nannyUserId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }
    if (data) {
      reset({
        full_name: data.full_name || "",
        phone: data.phone || "",
        photo: data.avatar_url || undefined,
      });
      // Prepopulate the first photo container if an avatar_url exists,
      // converting null to undefined.
      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[0] = data.avatar_url || undefined;
        return newPhotos;
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [reset]);

  // Function to upload photo to Supabase Storage.
  const uploadPhoto = async (file: File, userId: string): Promise<string | null> => {
    const client = createClient();
    // Create a unique file path.
    const filePath = `nanny_${userId}_${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await client.storage
      .from("profile_pictures")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) {
      console.error("Error uploading photo:", uploadError);
      return null;
    }
    // Get the public URL for the uploaded image.
    const { data } = client.storage.from("profile_pictures").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    return publicUrl;
  };

  // On form submission.
  const onSubmit = async (data: NannyBioFormValues) => {
    setSubmitting(true);
    const client = createClient();
    let nannyUserId = localStorage.getItem("nannyUserId");

    // Normalize the phone number to ensure it starts with a "+"
    let normalizedPhone = data.phone.trim();
    if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    // If no nanny user id, invoke the edge function with the normalized phone number.
    if (!nannyUserId) {
      const { data: fnData, error: fnError } = await client.functions.invoke(
        "create_nanny_user_account",
        {
          body: { phone_number: normalizedPhone },
        }
      );
      
      if (fnError) {
        toast.error("Error generating user id.");
        console.error("Edge function error:", fnError);
        setSubmitting(false);
        return;
      }
      nannyUserId = fnData?.user_id;
      if (!nannyUserId) {
        toast.error("No user id returned from function.");
        setSubmitting(false);
        return;
      }
      localStorage.setItem("nannyUserId", nannyUserId);
    } else {
      console.log("Using existing nannyUserId:", nannyUserId);
    }

    let avatar_url: string | null = null;
    // If the first photo is a File, upload it and get its public URL.
    if (photo instanceof File) {
      avatar_url = await uploadPhoto(photo, nannyUserId);
      if (!avatar_url) {
        toast.error("Error uploading profile photo.");
        setSubmitting(false);
        return;
      }
    } else if (typeof photo === "string" && photo.startsWith("http")) {
      avatar_url = photo;
    }

    // Prepare payload for upsert. Only the first photo is used for avatar_url.
    const payload: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      role: "nanny";
    } = {
      id: nannyUserId,
      full_name: data.full_name,
      avatar_url: avatar_url,
      role: "nanny", // This is now typed as the literal "nanny"
    };
    

    const { error } = await client
      .from("user_accounts")
      .upsert(payload, { onConflict: "id" });
    if (error) {
      toast.error("Error saving bio information.");
      console.error("Error saving bio info:", error);
      setSubmitting(false);
      return;
    }
    toast.success("Bio information saved successfully!");
    setSubmitting(false);
    onNext();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%] max-h-[70%] md:max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title Section */}
          <div className="flex items-center mb-5 border-b justify-between">
            <h1 className="font-barlow font-semibold text-lg">Onboard New Nanny</h1>
            <button type="button" onClick={onClose} className="p-2 bg-[#FAFAFA] rounded-full">
              <Image src="/nannies-assets/close.svg" alt="Close Icon" width={20} height={20} />
            </button>
          </div>
          {/* Navigation / Progress Section */}
          <div className="flex flex-col gap-4 md:gap-7 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base font-barlow">Add Bio Information</span>
              <span className="text-sm md:text-base font-barlow">Personal Details</span>
              <span className="text-sm md:text-base font-barlow">Contact Information</span>
              <span className="text-sm md:text-base font-barlow">Professional Information</span>
            </div>
            <div className="w-full h-1 rounded-md bg-[#cccaca54]">
              <div className="h-full rounded-md bg-[#6000DA] w-[21%] md:w-[10%]"></div>
            </div>
          </div>
          {/* Bio Information UI */}
          <div className="mt-4">
            <p className="mb-2 font-barlow text-base font-semibold">Add Bio Information</p>
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
          {/* Phone Number UI */}
          <div className="mt-4">
            <label htmlFor="phone_number" className="block font-barlow text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              id="phone_number"
              placeholder="Enter phone number"
              {...register("phone")}
              className="mt-1 p-2 border border-gray-300 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>
          {/* Profile Photos UI */}
          <div className="mt-5">
            <p className="font-barlow text-sm">Add Profile Photos</p>
            <div className="flex flex-col md:flex-row items-center gap-3 mt-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative border-dotted border-2 w-full md:w-1/4 h-40 border-gray-300 shadow-md rounded-lg p-1 flex flex-col gap-2 items-center justify-center"
                >
                  {photos[index] instanceof File ? (
                    <>
                      <Image
                        src={URL.createObjectURL(photos[index] as File)}
                        alt="Photo Preview"
                        className="object-cover rounded-lg w-full h-full"
                        width={100}
                        height={100}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute bottom-2 right-2 p-2 flex items-center justify-center bg-[#cecece] rounded-full"
                      >
                        <Image src="/nannies-assets/delete.svg" alt="Delete Photo" width={25} height={25} />
                      </button>
                    </>
                  ) : typeof photos[index] === "string" && photos[index].startsWith("http") ? (
                    <Image
                      src={photos[index] as string}
                      alt="Photo Preview"
                      className="object-cover rounded-lg w-full h-full"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => document.getElementById(`photo-upload-${index}`)?.click()}
                        className="p-2 flex items-center justify-center bg-[#6000DA12] rounded-full"
                      >
                        <Image src="/nannies-assets/add-photo.svg" alt="Add Photo Icon" width={25} height={25} />
                      </button>
                      <span className="font-barlow text-xs">Add Photo</span>
                      <span className="font-barlow text-xs text-gray-500">
                        Attach PNG/JPG (max size 3mb)
                      </span>
                    </>
                  )}
                  <input
                    id={`photo-upload-${index}`}
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={(e) => handlePhotoChange(index, e)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button type="button" className="px-8 py-3 bg-[#F5F5F5] rounded-lg" onClick={onClose}>
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 rounded-lg text-white ${
                submitting ? "bg-[#6000DA] opacity-50 cursor-not-allowed" : "bg-[#6000DA]"
              }`}
            >
              {submitting ? (
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

export default BioModal;
