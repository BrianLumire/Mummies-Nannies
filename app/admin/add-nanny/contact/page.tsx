"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactInfoSchema, ContactInfoFormValues } from "@/hooks/nanny/nannySchema";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { TablesInsert } from "@/database.types";

// Define a type for each contact with a string id.
interface Contact {
  id: string;
  name: string;
  relationship: string;
}

const ContactInfoPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
  });

  useEffect(() => {
    const fetchUserAccount = async () => {
      const userId = sessionStorage.getItem("nannyUserId");
      if (userId) {
        const { data, error } = await supabase
          .from("user_accounts")
          .select()
          .eq("id", userId)
          .single();
        if (!error && data) {
          reset({
            phone: data.phone ?? undefined,
           
          });
        }
      }
    };
    fetchUserAccount();
  }, [supabase, reset]);
  useEffect(() => {
    const fetchNannyData = async () => {
      const userId = sessionStorage.getItem("nannyUserId");
      if (userId) {
        const { data, error } = await supabase
          .from("nannies")
          .select("location")
          .eq("user_id", userId)
          .single();
        if (!error && data) {
          reset({
            location: data.location ?? undefined,
          });
        }
      }
    };
    fetchNannyData();
  }, [supabase, reset]);
  
  

  // Manage contacts locally
  const [contacts, setContacts] = useState<Contact[]>([
    { id: crypto.randomUUID(), name: "", relationship: "" },
  ]);

  const addContact = () => {
    const newContact: Contact = { id: crypto.randomUUID(), name: "", relationship: "" };
    setContacts((prev) => [...prev, newContact]);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const handleContactChange = (id: string, field: "name" | "relationship", value: string) => {
    setContacts((prev) =>
      prev.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact))
    );
  };

  const onSubmit = async (data: ContactInfoFormValues) => {
    try {
      console.log("Raw phone from form:", data.phone);

      const formattedPhone = data.phone.startsWith("0")
        ? "+254" + data.phone.slice(1)
        : "+254" + data.phone;
      console.log("Formatted phone:", formattedPhone);

      // Generate or retrieve the user ID via a Supabase function call.
      // For this example, we'll call the function and assume it returns a valid user_id.
      const { data: fnData, error: fnError } = await supabase.functions.invoke("create_nanny_user_account", {
        body: { phone_number: formattedPhone },
      });
      if (fnError) throw fnError;
      const generatedUserId = fnData?.user_id;
      console.log("Generated User ID:", generatedUserId);
      if (!generatedUserId) throw new Error("User ID is missing from the function response.");

      // Upsert phone into user_accounts
      const userPayload: TablesInsert<"user_accounts"> = {
        id: generatedUserId,
        phone: formattedPhone,
      };
      const { error: userError } = await supabase
        .from("user_accounts")
        .upsert(userPayload)
        .select();
      if (userError) throw userError;

      // Upsert location into nannies
      const nannyPayload: TablesInsert<"nannies"> = {
        user_id: generatedUserId,
        location: data.location,
      };
      const { data: nannyData, error: nannyError } = await supabase
        .from("nannies")
        .upsert(nannyPayload)
        .select();
      if (nannyError) throw nannyError;
      if (!nannyData || nannyData.length === 0) throw new Error("Nanny record not found.");
      const nannyId = nannyData[0].id;

      // Prepare contacts payload. Cast relationship to the proper union type.
      const contactsPayload = contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        nanny_id: nannyId,
        phone: "", // Provide a default phone if required
        relationship: contact.relationship as "spouse" | "parent" | "sibling" | "child" | "friend" | "cousin" | "other",
      }));
      const { error: contactError } = await supabase
        .from("contact_persons")
        .upsert(contactsPayload)
        .select();
      if (contactError) throw contactError;

      // Combine the form data with contacts and generated user id
      const completeData = { ...data, contacts, user_id: generatedUserId };
      console.log("Complete Contact Info:", completeData);
      toast.success("Contact information saved!");
      sessionStorage.setItem("nannyContactData", JSON.stringify(completeData));
      router.push("/admin/add-nanny/professional");
    } catch (error: unknown) {
      console.error("Error creating user account:", error);
      toast.error("Error creating user account");
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
              <div className="h-full rounded-md bg-[#6000DA] w-[66%] md:w-[30%]"></div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Column: Location */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 font-barlow">Location</label>
              <div className="relative mt-1">
                <Image src="/nannies-assets/location-icon.svg" alt="Location Icon" width={20} height={20} className="absolute top-1/2 left-3 transform -translate-y-1/2" />
                <input type="text" id="location" {...register("location")} className="pl-10 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter Location" />
                {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
              </div>
            </div>
            {/* Right Column: Phone */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 font-barlow">Phone Number</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+254</span>
                <input type="text" id="phone" {...register("phone")} className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter Phone (9 digits)" />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Contacts Section */}
          <div className="mt-4">
            <p className="font-barlow font-semibold text-base">Add Contact Person (s)</p>
            {contacts.map((contact) => (
              <div key={contact.id} className="border flex flex-col md:flex-row items-center gap-3 border-gray-200 p-3 rounded-lg mt-4 shadow-md">
                <div className="w-full">
                  <input type="text" value={contact.name} onChange={(e) => handleContactChange(contact.id, "name", e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter Name" />
                </div>
                <div className="w-full relative">
                  <select value={contact.relationship} onChange={(e) => handleContactChange(contact.id, "relationship", e.target.value)} className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="cousin">Cousin</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-[55%] transform -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
                <button type="button" onClick={() => removeContact(contact.id)} className="p-[12px] flex items-center justify-center border bg-[#FFFFFF66] rounded-lg">
                  <Image src="/nannies-assets/delete-icon.svg" alt="Delete Icon" width={26} height={26} />
                </button>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-3 border-b pb-4">
              <button type="button" onClick={addContact} className="p-3 flex items-center justify-center bg-[#F0F0F0] rounded-full">
                <Image src="/nannies-assets/add-icon1.svg" alt="Add Icon" width={20} height={20} />
              </button>
              <span className="font-barlow text-sm">Add Contact Person</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full p-3 sm:w-[70%] md:w-[80%] mx-auto">
          <div className="mt-5 flex justify-center md:justify-end items-center gap-3">
            <button type="button" onClick={() => router.push("/admin/nannies")} className="px-8 py-3 bg-[#F5F5F5] rounded-lg">Discard</button>
            <button type="submit" className="px-8 py-3 bg-[#6000DA] rounded-lg text-white">Proceed</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactInfoPage;
