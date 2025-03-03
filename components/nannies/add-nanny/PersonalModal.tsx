"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

// Constant array of tribes as provided.
const tribes = [
  { id: "02979904-c90c-4c69-82d6-28765d1e9611", label: "Sengwer" },
  { id: "03157a93-c454-4af8-86d0-dee4a5d20459", label: "Sabaot" },
  { id: "045b58d9-1098-4173-9b18-5cfd91c6e418", label: "Kamba" },
  { id: "078c0a55-6970-499a-aee7-47fed014a819", label: "Basuba" },
  { id: "07d93f67-9cf0-4de0-b749-a1153267f675", label: "Tugen" },
  { id: "08f56736-6e1c-4751-bbc1-fd98b9553571", label: "Gusii" },
  { id: "09d451e0-a891-4ec6-a2b8-8cd9873049a6", label: "Taveta" },
  { id: "17fd8ebe-dffa-490c-86a1-4b75c24b0e4e", label: "Terik" },
  { id: "1b6d55bd-4306-4bce-8b55-7758cb607435", label: "Njemps (Ilchamus)" },
  { id: "1bef8061-1a48-4efc-a3d3-adc3bc8e0a45", label: "Swahili" },
  { id: "207e5a86-0c81-4a5c-a53e-3a76d46ff488", label: "Embu" },
  { id: "281161f5-08ed-4bdf-a9af-615f3e8b2527", label: "Kikuyu" },
  { id: "2bfae3e6-010d-4c03-a368-5b4e07df9fcd", label: "Burji" },
  { id: "2c4e4f36-a7d4-4cc0-b1b2-3ed349728c03", label: "Waata" },
  { id: "37bb2c92-977e-406b-9caf-9f86608cbd92", label: "Marakwet" },
  { id: "39c28ee2-f98e-4e3e-b030-68e4453fe68a", label: "Rendille" },
  { id: "4464dc17-2493-45df-a901-8596caa42bb6", label: "Kalenjin" },
  { id: "46624399-4ba0-43a1-bf24-e52334405adb", label: "Ogiek" },
  { id: "730b8f71-15ee-494f-97a2-7a8ff71d1f0f", label: "Taita" },
  { id: "778becc7-cb42-4054-a54d-4f5c01bb3423", label: "Samburu" },
  { id: "8034904a-3391-4d72-b041-a24a593f7c22", label: "Somali" },
  { id: "82f923a7-ddcd-404e-b9ca-472afdcd949d", label: "Meru" },
  { id: "83391aad-b79b-400a-9e1b-abf6dc18ae18", label: "Sakuye" },
  { id: "86856a1a-e41f-44ff-9c07-3d510f66f4f6", label: "Other" },
  { id: "91e8d735-e564-41fd-b93c-d783c5998413", label: "Endorois" },
  { id: "93cc1c68-1196-4f4f-855e-7e7f3aecad45", label: "Dorobo" },
  { id: "942b9550-8698-4ac1-a85c-00cb44857eab", label: "Pokot" },
  { id: "98eede80-2f23-4199-b9dd-eba4c3bd654b", label: "Kurya" },
  { id: "992f14ce-3bc6-437d-adad-4393b6c031f0", label: "Orma" },
  { id: "99b7bd11-8be8-438c-9542-e0fbee51f538", label: "Nandi" },
  { id: "a66af293-ecfd-4fae-8c7b-8545f299b079", label: "Turkana" },
  { id: "aa03b772-69a8-43cf-b003-8dd78dd44364", label: "Pokomo" },
  { id: "aff04504-89e7-438f-8b10-da1e20395091", label: "Borana" },
  { id: "c14c22ee-be3c-4bcd-a3f9-3b93c15c6ebf", label: "Boni (Aweer)" },
  { id: "ca83864f-2cbd-4cd4-88f3-24564ef63533", label: "Mijikenda" },
  { id: "caf49d4e-c054-4622-9cf0-f9159cdaaae8", label: "El Molo" },
  { id: "cb2abc85-c55a-4d89-b6ac-8ab2e85000bf", label: "Maasai" },
  { id: "ccdd79e8-1cd3-4aac-a0a6-0af12bd1fe50", label: "Luo" },
  { id: "dec13e28-8705-406d-8bba-abcf8bfb070b", label: "Keiyo" },
  { id: "e7ccdd27-bc73-4dea-bc72-e742d1659b27", label: "Gabbra" },
  { id: "edd7effd-50f7-49e8-8be1-c0857e0952a5", label: "Bajuni" },
  { id: "f55d868c-4785-41ad-bf42-a85bed28f3fa", label: "Suba" },
  { id: "fb6dab80-80b7-4cbf-bb73-6f76d921da73", label: "Luhya" },
  { id: "fdf3a968-01ce-4e61-a5e1-47e4ce4d4d84", label: "Dahalo" },
];

interface PersonalModalProps {
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

const PersonalModal: React.FC<PersonalModalProps> = ({ onNext, onBack, onClose }) => {
  // State for form fields
  const [nationality, setNationality] = useState("");
  const [religion, setReligion] = useState("");
  // Now tribe holds the tribe UUID, not just a text value.
  const [tribe, setTribe] = useState("");
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
      // Make sure to set the UUID from your tribes table here.
      setTribe(data.tribe_id || "");
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

  // On form submission, upsert the nannies table record without handling ID image uploads.
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

    // Upsert the record in the nannies table.
    const { data, error } = await client
      .from("nannies")
      .upsert(
        {
          user_id: nannyUserId,
          nationality,
          religion: religion as "christian" | "islam" | "hindu" | "pagan" | "non_religious",
          tribe_id: tribe,
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
                    Tribe
                  </label>
                  <select
                    id="tribe"
                    value={tribe}
                    onChange={(e) => setTribe(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Tribe</option>
                    {tribes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
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
