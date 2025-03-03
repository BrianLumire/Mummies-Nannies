"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

interface PersonalModalProps {
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

const PersonalModal: React.FC<PersonalModalProps> = ({ onNext, onBack, onClose }) => {
  // State for form fields
  const [nationality, setNationality] = useState("");
  const [religion, setReligion] = useState("");
  const [tribe, setTribe] = useState(""); // This will store the tribe_id
  const [nationalIdImages, setNationalIdImages] = useState<(File | string | undefined)[]>([
    undefined,
    undefined,
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing data from the nannies table to repopulate the form.
  const fetchPersonalData = async () => {
    const client = createClient();
    const nannyUserId = localStorage.getItem("nannyUserId");
    if (!nannyUserId) {
      console.error("No nanny user ID found.");
      return;
    }
    const { data, error } = await client
      .from("nannies")
      .select("*")
      .eq("user_id", nannyUserId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching personal data:", error);
      return;
    }
    if (data) {
      setNationality(data.nationality || "");
      setReligion(data.religion || "");
      setTribe(data.tribe_id || "");
      // Note: We don't expect a column for national_id_images here.
    }
  };

  useEffect(() => {
    fetchPersonalData();
  }, []);

  // Handle National ID image file changes.
  const handleNationalIdChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setNationalIdImages((prev) => {
        const newImages = [...prev];
        newImages[index] = files[0];
        return newImages;
      });
    }
  };

  const removeNationalIdImage = (index: number) => {
    setNationalIdImages((prev) => {
      const newImages = [...prev];
      newImages[index] = undefined;
      return newImages;
    });
  };

  // Function to upload a file to Supabase Storage in the "nannies" bucket.
  const uploadFile = async (file: File, userId: string, type: string): Promise<string | null> => {
    const client = createClient();
    const filePath = `${type}_${userId}_${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await client.storage
      .from("nannies")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return null;
    }
    const { data } = client.storage.from("nannies").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // On form submission, upsert the nannies table record and store the primary key.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationality || !religion || !tribe) {
      toast.error("Please fill out all required fields.");
      return;
    }
    const client = createClient();
    const nannyUserId = localStorage.getItem("nannyUserId");
    if (!nannyUserId) {
      toast.error("No nanny user account found.");
      return;
    }
    setSubmitting(true);

    // Upload any new National ID images.
    // These files are uploaded to the "nannies" bucket.
    const uploadedImages: string[] = [];
    for (let i = 0; i < nationalIdImages.length; i++) {
      const img = nationalIdImages[i];
      if (img instanceof File) {
        const url = await uploadFile(img, nannyUserId, "national_id");
        if (url) {
          uploadedImages.push(url);
        } else {
          toast.error("Error uploading national ID image.");
          setSubmitting(false);
          return;
        }
      } else if (typeof img === "string") {
        uploadedImages.push(img);
      }
    }

    // Upsert the record in the nannies table.
    // Note: We do not include national_id_images in the payload because that column does not exist.
    // We also cast the payload to "any" to bypass type errors for custom columns.
    const { data, error } = await client
      .from("nannies")
      .upsert(
        {
          user_id: nannyUserId,
          nationality,
          religion: religion as "christian" | "islam" | "hindu" | "pagan" | "non_religious",
          tribe_id: tribe,
          // Optionally, if you later add a column for national ID images, include it here.
          // national_id_images: uploadedImages,
        } as any,
        { onConflict: "user_id" }
      )
      .select();
    if (error) {
      toast.error("Error saving personal details.");
      console.error("Error saving personal details:", error);
      setSubmitting(false);
      return;
    }
    // Assuming data returns an array with the updated/inserted record, store its primary key.
    if (data && data.length > 0) {
      localStorage.setItem("nannyId", data[0].id);
    }
    toast.success("Personal details saved successfully!");
    setSubmitting(false);
    onNext();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%] max-h-[70%] md:max-h-screen overflow-y-auto">
        {/* Title Section with Back Arrow */}
        <div className="flex items-center mb-5 border-b justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="p-[6px] rounded-lg bg-gray-100"
            >
              <Image
                src="/mummies-assets/back-arrow.svg"
                alt="Back Arrow"
                width={20}
                height={20}
              />
            </button>
            <h1 className="font-barlow font-semibold text-lg">Onboard New Nanny</h1>
          </div>
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
          {/* Progress Bar */}
          <div className="w-full h-1 rounded-md bg-[#cccaca54]">
            <div className="h-full rounded-md bg-[#6000DA] w-[42%] md:w-[20%]"></div>
          </div>
        </div>
        {/* Form Fields (Personal Details UI) */}
        <form onSubmit={handleSubmit}>
          <div>
            <p className="font-barlow font-semibold text-base">Personal Details</p>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              {/* Left Column */}
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 font-barlow">
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    placeholder="Enter Nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="religion" className="block text-sm font-medium text-gray-700 font-barlow">
                    Religion
                  </label>
                  <select
                    id="religion"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="">Select Religion</option>
                    <option value="christian">Christian</option>
                    <option value="islam">Islam</option>
                    <option value="hindu">Hindu</option>
                    <option value="pagan">Pagan</option>
                    <option value="non_religious">Non Religious</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-[65%] transform -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
              </div>
              {/* Right Column */}
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <div>
                  <label htmlFor="tribe" className="block text-sm font-medium text-gray-700 font-barlow">
                    Tribe (ID)
                  </label>
                  <input
                    type="text"
                    id="tribe"
                    placeholder="Enter Tribe ID"
                    value={tribe}
                    onChange={(e) => setTribe(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Upload Section (National ID Images) */}
          <div>
            <p className="font-barlow text-sm font-medium mt-4">Upload National ID Images</p>
            <div className="flex flex-col md:flex-row items-center gap-3 mt-5">
              {nationalIdImages.map((img, index) => (
                <div
                  key={index}
                  className="border-dotted border-2 w-full md:w-1/4 h-40 border-gray-300 shadow-md rounded-lg p-1 flex flex-col gap-2 items-center justify-center"
                >
                  {img instanceof File ? (
                    <>
                      <Image
                        src={URL.createObjectURL(img)}
                        alt="National ID Preview"
                        className="object-cover rounded-lg w-full h-full"
                        width={100}
                        height={100}
                      />
                      <button
                        type="button"
                        onClick={() => removeNationalIdImage(index)}
                        className="absolute bottom-2 right-2 p-2 flex items-center justify-center bg-[#cecece] rounded-full"
                      >
                        <Image src="/nannies-assets/delete.svg" alt="Delete Photo" width={25} height={25} />
                      </button>
                    </>
                  ) : typeof img === "string" && img.startsWith("http") ? (
                    <Image
                      src={img}
                      alt="National ID Preview"
                      className="object-cover rounded-lg w-full h-full"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => document.getElementById(`nid-upload-${index}`)?.click()}
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
                    id={`nid-upload-${index}`}
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={(e) => handleNationalIdChange(index, e)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-3 bg-[#F5F5F5] rounded-lg"
            >
              Back
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

export default PersonalModal;
