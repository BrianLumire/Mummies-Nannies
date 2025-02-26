"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nannySchema, NannyFormValues } from "@/hooks/nanny/nannySchema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

const AddNannyForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NannyFormValues>({
    resolver: zodResolver(nannySchema),
  });

  const images = watch("images");
  const router = useRouter();

  const onSubmit = async (_data: NannyFormValues) => {
    try {
      // Here, you'll integrate with Supabase to create a new nanny
      // For example, upload images first and get URLs, then insert the nanny record.
      // const uploadedImageUrls = await uploadImages(_data.images);
      // const { error } = await supabase.from("nannies").insert({ ..._data, images: uploadedImageUrls });

      // Placeholder for successful creation
      toast.success("Nanny created successfully!");
      router.push("/admin/nannies"); // Redirect after successful creation
    } catch (err) {
      console.error("Error creating nanny:", err);
      toast.error("Error creating nanny");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setValue("images", Array.from(files));
    }
  };

  const removeImage = (index: number) => {
    const currentImages = images || [];
    currentImages.splice(index, 1);
    setValue("images", [...currentImages]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="full_name">Full Name</label>
        <input type="text" id="full_name" {...register("full_name")} />
        {errors.full_name && <p className="text-red-500">{errors.full_name.message}</p>}
      </div>

      <div>
        <label htmlFor="phone">Phone</label>
        <input type="text" id="phone" {...register("phone")} />
        {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="location">Location</label>
        <input type="text" id="location" {...register("location")} />
        {errors.location && <p className="text-red-500">{errors.location.message}</p>}
      </div>

      <div className="flex gap-4">
        {[0, 1, 2, 3].map((containerIndex) => {
          const file = images?.[containerIndex];
          return (
            <div key={containerIndex} className="relative border-dotted border-2 w-full md:w-1/4 h-40 border-gray-300 shadow-md rounded-lg p-1 flex flex-col gap-2 items-center justify-center">
              {file ? (
                <>
                  <img
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
      <input
        id="image-upload"
        type="file"
        accept="image/png, image/jpeg"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />
      {errors.images && <p className="text-red-500">{errors.images.message}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" className="px-8 py-3 bg-[#F5F5F5] rounded-lg" onClick={() => router.push("/admin/nannies")}>
          Discard
        </button>
        <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">
          Complete
        </button>
      </div>
    </form>
  );
};

export default AddNannyForm;