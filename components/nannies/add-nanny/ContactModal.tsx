"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  relationship: string;
}

interface ContactModalProps {
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onNext, onBack, onClose }) => {
  // State for location and contacts.
  const [location, setLocation] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([
    { id: crypto.randomUUID(), name: "", relationship: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing data: location from nannies table and contact persons.
  const fetchData = async () => {
    const client = createClient();
    const nannyId = localStorage.getItem("nannyId");
    if (!nannyId) {
      console.error("No nanny ID found in storage.");
      return;
    }
    // Fetch location from nannies table.
    const { data: nannyData, error: nannyError } = await client
      .from("nannies")
      .select("location")
      .eq("id", nannyId)
      .maybeSingle();
    if (nannyError) {
      console.error("Error fetching nanny location:", nannyError);
    } else if (nannyData) {
      setLocation(nannyData.location || "");
    }
    // Fetch contact persons linked to this nanny.
    const { data: contactsData, error: contactsError } = await client
      .from("contact_persons")
      .select("*")
      .eq("nanny_id", nannyId);
    if (contactsError) {
      console.error("Error fetching contact persons:", contactsError);
    } else if (contactsData) {
      setContacts(
        contactsData.length > 0
          ? contactsData
          : [{ id: crypto.randomUUID(), name: "", relationship: "" }]
      );
    } else {
      setContacts([{ id: crypto.randomUUID(), name: "", relationship: "" }]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Contact person logic.
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

  // Handle form submission.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error("Please enter your location.");
      return;
    }
    if (contacts.length === 0) {
      toast.error("Please add at least one contact person.");
      return;
    }
    const client = createClient();
    const nannyId = localStorage.getItem("nannyId");
    if (!nannyId) {
      toast.error("No nanny record found. Please complete previous steps.");
      return;
    }
    setSubmitting(true);

    // Update location in the nannies table.
    const { error: nannyError } = await client
      .from("nannies")
      .upsert({ id: nannyId, location }, { onConflict: "id" });
    if (nannyError) {
      toast.error("Error updating location.");
      console.error("Error updating location:", nannyError);
      setSubmitting(false);
      return;
    }

    // Upsert each contact person into the contact_persons table.
    // Note: The table expects a phone property of type string and relationship as one of:
    // "spouse" | "parent" | "sibling" | "child" | "friend" | "cousin" | "other".
    for (const contact of contacts) {
      const { error: contactError } = await client
        .from("contact_persons")
        .upsert(
          {
            id: contact.id,
            name: contact.name,
            phone: "", // supply a default value as phone is required by the type.
            relationship: contact.relationship as
              | "spouse"
              | "parent"
              | "sibling"
              | "child"
              | "friend"
              | "cousin"
              | "other",
            nanny_id: nannyId,
          },
          { onConflict: "id" }
        );
      if (contactError) {
        toast.error("Error saving contact information.");
        console.error("Error saving contact info:", contactError);
        setSubmitting(false);
        return;
      }
    }
    toast.success("Contact information saved successfully!");
    setSubmitting(false);
    onNext();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-[95%] md:w-[80%]">
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
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#FAFAFA] rounded-full"
          >
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
            <div className="h-full rounded-md bg-[#6000DA] w-[66%] md:w-[30%]"></div>
          </div>
        </div>
        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          {/* Location Input */}
          <div className="mt-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 font-barlow">
              Location
            </label>
            <input
              type="text"
              id="location"
              placeholder="Enter Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Contacts Section */}
          <div className="mt-4">
            <p className="font-barlow font-semibold text-base">Add Contact Person(s)</p>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="border flex flex-col md:flex-row items-center gap-3 border-gray-200 p-3 rounded-lg mt-4 shadow-md"
              >
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Enter Contact Name"
                    value={contact.name}
                    onChange={(e) =>
                      setContacts((prev) =>
                        prev.map((c) =>
                          c.id === contact.id ? { ...c, name: e.target.value } : c
                        )
                      )
                    }
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full relative">
                  <select
                    value={contact.relationship}
                    onChange={(e) =>
                      setContacts((prev) =>
                        prev.map((c) =>
                          c.id === contact.id ? { ...c, relationship: e.target.value } : c
                        )
                      )
                    }
                    className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
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
                <button
                  type="button"
                  onClick={() =>
                    setContacts((prev) => prev.filter((c) => c.id !== contact.id))
                  }
                  className="p-[12px] flex items-center justify-center border bg-[#FFFFFF66] rounded-lg"
                >
                  <Image src="/nannies-assets/delete-icon.svg" alt="Delete Icon" width={26} height={26} />
                </button>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-3 border-b pb-4">
              <button
                type="button"
                onClick={addContact}
                className="p-3 flex items-center justify-center bg-[#F0F0F0] rounded-full"
              >
                <Image src="/nannies-assets/add-icon1.svg" alt="Add Icon" width={20} height={20} />
              </button>
              <span className="font-barlow text-sm">Add Contact Person</span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-5 flex justify-center md:justify-end items-center gap-3">
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

export default ContactModal;
