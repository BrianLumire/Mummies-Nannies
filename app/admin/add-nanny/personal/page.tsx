"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalDetailsSchema, PersonalDetailsFormValues } from "@/hooks/nanny/nannySchema";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

const PersonalDetailsPage: React.FC = () => {
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>(["", ""]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
  });

  const onSubmit = (data: PersonalDetailsFormValues) => {
    console.log("Personal Details:", data);
    // Save personal details to sessionStorage
    sessionStorage.setItem("nannyPersonalData", JSON.stringify(data));
    toast.success("Personal details saved!");
    router.push("/admin/add-nanny/contact");
  };

  // File change handler for updating the preview for each container
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-6">
        {/* Title Section */}
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
              <div className="h-full rounded-md bg-[#6000DA] w-[42%] md:w-[20%]"></div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
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
                  {...register("nationality")}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter Nationality"
                />
                {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality.message}</p>}
              </div>
              <div className="relative">
                <label htmlFor="religion" className="block text-sm font-medium text-gray-700 font-barlow">
                  Religion
                </label>
                <select
                  id="religion"
                  {...register("religion")}
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
                {errors.religion && <p className="text-red-500 text-sm">{errors.religion.message}</p>}
              </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">
              <div>
                <label htmlFor="tribe" className="block text-sm font-medium text-gray-700 font-barlow">
                  Tribe
                </label>
                <input
                  type="text"
                  id="tribe"
                  {...register("tribe")}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter Tribe"
                />
                {errors.tribe && <p className="text-red-500 text-sm">{errors.tribe.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
          <p className="font-barlow text-sm font-medium">Upload National ID Images</p>
          <div className="flex flex-col md:flex-row items-center gap-3 mt-5">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="border-dotted border-2 w-full md:w-1/4 h-40 border-gray-300 shadow-md rounded-lg p-1 flex flex-col gap-2 items-center justify-center"
              >
                {previews[index] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={previews[index]}
                      alt="Uploaded photo preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById(`personal-upload-${index}`)?.click()
                      }
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
                {/* Hidden file input for this container */}
                <input
                  id={`personal-upload-${index}`}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, index)}
                />
              </div>
            ))}
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
              Proceed
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailsPage;
