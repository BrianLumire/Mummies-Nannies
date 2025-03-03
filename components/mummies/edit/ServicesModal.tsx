"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { Database } from "@/database.types";

// Define a schema for the service page (currently no additional form fields).
const serviceSchema = z.object({});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceMummyProps {
  mammiesId: string; // The specific mammies table id passed from the route params
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}

// Allowed nanny services from your Database types.
type NannyService = Database["public"]["Enums"]["nanny_services"];

const EditServiceMummy: React.FC<ServiceMummyProps> = ({ mammiesId, onClose, onBack, onNext }) => {
  const { handleSubmit } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  const [selectedServices, setSelectedServices] = useState<NannyService[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to render a service card.
  const renderServiceCard = (
    serviceKey: NannyService,
    label: string,
    imageSrc: string,
    extraClasses?: string
  ) => {
    const isSelected = selectedServices.includes(serviceKey);
    return (
      <div
        onClick={() => {
          if (isSelected) {
            // Remove service if already selected.
            setSelectedServices((prev) =>
              prev.filter((service) => service !== serviceKey)
            );
          } else {
            // Add service if fewer than 2 are selected.
            if (selectedServices.length < 2) {
              setSelectedServices((prev) => [...prev, serviceKey]);
            } else {
              toast.error("You can select at most 2 services");
            }
          }
        }}
        className={`flex flex-col items-center gap-4 border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected ? "border-[#6000DA] bg-[#6000DA12]" : "border-gray-300 bg-white"
        } ${extraClasses}`}
      >
        <Image src={imageSrc} alt={label} width={50} height={50} />
        <span className="text-base font-barlow font-semibold">{label}</span>
      </div>
    );
  };

  // Fetch the existing service selection from the 'mammies' table using mammiesId.
  const fetchServiceData = useCallback(async () => {
    setLoading(true);
    const client = createClient();

    const result = await client
      .from("mammies")
      .select("*")
      .eq("id", mammiesId)
      .maybeSingle();

    if (result.error) {
      console.error("Error fetching service data:", result.error);
      toast.error("Error fetching service data.");
    } else if (result.data && result.data.nanny_services) {
      // Assuming nanny_services is stored as an array.
      setSelectedServices(result.data.nanny_services);
    }
    setLoading(false);
  }, [mammiesId]);

  // Fetch data on component mount.
  useEffect(() => {
    fetchServiceData();
  }, [fetchServiceData]);

  // Handle form submission: update the database.
  const onSubmit = async (_data: ServiceFormValues) => {
    void _data; 
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service before proceeding.");
      return;
    }
  
    setLoading(true);
    const client = createClient();
  
    // Update the mammies record by matching the primary key (mammiesId)
    const { error } = await client
      .from("mammies")
      .upsert(
        {
          id: mammiesId,
          nanny_services: selectedServices,
        },
        { onConflict: "id" }
      );
  
    if (error) {
      console.error("Error saving service information:", error);
      toast.error("Error saving service information.");
      setLoading(false);
      return;
    }
  
    toast.success("Service information updated successfully!");
    setLoading(false);
    onNext();
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
            <div className="w-full p-3">
              <div className="flex items-center mb-5 border-b justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-[6px] rounded-lg bg-gray-100"
                    onClick={onBack}
                  >
                    <Image
                      src="/mummies-assets/back-arrow.svg"
                      alt="Back Arrow"
                      width={20}
                      height={20}
                    />
                  </button>
                  <h1 className="font-barlow font-semibold text-lg">Edit Mummy</h1>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 flex items-center justify-center bg-[#FAFAFA] rounded-full"
                >
                  <Image
                    src="/nannies-assets/close.svg"
                    alt="Close Icon"
                    width={20}
                    height={20}
                  />
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
                  {/* For step 2 out of 5, progress at 40% */}
                  <div className="h-full rounded-md bg-[#6000DA] w-[40%] md:w-[19%]"></div>
                </div>
              </div>
            </div>

            {/* Main Content Section: Service Selection */}
            <div className="w-full flex flex-col md:flex-row items-center gap-3 md:gap-6 p-3">
              {renderServiceCard(
                "childcare",
                "Nanny for Child Care",
                "/mummies-assets/amico.svg"
              )}
              {renderServiceCard(
                "elderly",
                "Nanny for Elderly People",
                "/mummies-assets/bro.svg"
              )}
              {renderServiceCard(
                "special_needs",
                "Nanny for Special Needs",
                "/mummies-assets/rafiki.svg"
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full p-3 flex items-center justify-center md:justify-end gap-3">
              <button
                type="button"
                className="px-8 py-3 bg-[#F5F5F5] rounded-lg"
                onClick={onClose}
              >
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

export default EditServiceMummy;
