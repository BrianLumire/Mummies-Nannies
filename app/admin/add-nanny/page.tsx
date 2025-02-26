"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bioSchema, BioFormValues } from "@/hooks/nanny/nannySchema";
import { toast } from "sonner";

const AddNannyForm: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BioFormValues>({
    resolver: zodResolver(bioSchema),
  });

  // Watch images to render previews
  const images = watch("images");

  const onSubmit = (data: BioFormValues) => {
    console.log("Bio Data:", data);
    // Save bio data to sessionStorage for later retrieval
    sessionStorage.setItem("nannyBioData", JSON.stringify(data));
    toast.success("Bio information saved!");
    router.push("/admin/add-nanny/personal"); // proceed to Personal Details
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setValue("images", Array.from(files));
    }
  };

  const removeImage = (index: number) => {
    const currentImages = images ? [...images] : [];
    currentImages.splice(index, 1);
    setValue("images", currentImages);
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
              <div className="h-full rounded-md bg-[#6000DA] w-[21%] md:w-[10%]"></div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
          <div>
            <p className="mb-2 font-barlow text-base font-semibold">Edit Bio Information</p>
            <label htmlFor="full_name" className="block font-barlow text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              {...register("full_name")}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter full name"
            />
            {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
          </div>

          {/* File Upload Section */}
          <div className="mt-5">
            <p className="font-barlow text-sm">Add Profile Photos</p>
            <div className="flex flex-col md:flex-row w-full items-center gap-3 mt-3">
              {[0, 1, 2, 3].map((containerIndex) => {
                const file = images?.[containerIndex];
                return (
                  <div
                    key={containerIndex}
                    className="relative border-dotted border-2 w-full md:w-1/4 h-40 border-gray-300 shadow-md rounded-lg p-1 flex flex-col gap-2 items-center justify-center"
                  >
                    {file ? (
                      <>
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${containerIndex}`}
                          className="object-cover rounded-lg w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(containerIndex)}
                          className="absolute bottom-2 right-2 p-2 flex items-center justify-center bg-[#cecece] rounded-full"
                        >
                          <Image src="/nannies-assets/delete.svg" alt="Delete Photo" width={25} height={25} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => document.getElementById("image-upload")?.click()}
                          className="p-2 flex items-center justify-center bg-[#6000DA12] rounded-full"
                        >
                          <Image src="/nannies-assets/add-photo.svg" alt="Add Photo Icon" width={25} height={25} />
                        </button>
                        <span className="font-barlow text-xs">Add Photo</span>
                        <span className="font-barlow text-xs text-gray-500">Attach PNG/JPG (max size 3mb)</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Hidden file input */}
            <input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
            {errors.images && <p className="text-red-500 text-sm">{errors.images.message}</p>}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-center md:justify-end gap-3">
            <button
              type="button"
              className="px-8 py-3 bg-[#F5F5F5] rounded-lg"
              onClick={() => router.push("/admin/nannies")}
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

export default AddNannyForm;
