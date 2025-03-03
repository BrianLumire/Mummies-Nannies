"use client";

import React, { useState } from "react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

interface AvailabilityToggleProps {
  nannyId: string;
  currentAvailability: boolean;
  onChange?: (newAvailability: boolean) => void;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  nannyId,
  currentAvailability,
  onChange,
}) => {
  const [isOn, setIsOn] = useState<boolean>(currentAvailability);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const toggle = async () => {
    if (isUpdating) return; // Prevent toggle if update is in progress
    const newAvailability = !isOn;
    // Optimistically update local state
    setIsOn(newAvailability);
    setIsUpdating(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("nannies")
      .update({ is_available: newAvailability })
      .eq("id", nannyId);

    if (error) {
      toast.error("Failed to update availability: " + error.message);
      // Revert state if update fails
      setIsOn(!newAvailability);
    } else {
      toast.success("Availability updated successfully");
      onChange && onChange(newAvailability);
    }
    // Cooldown: Disable toggle for 3 seconds
    setTimeout(() => setIsUpdating(false), 3000);
  };

  return (
    <div className="flex items-center">
      <button
        onClick={toggle}
        disabled={isUpdating}
        className={`relative w-16 h-7 shadow-md border-2 border-white rounded-full transition-colors duration-300 ${
          isOn ? "bg-purple-200" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-300 ${
            isOn ? "bg-purple-700 translate-x-8" : "bg-gray-400 translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default AvailabilityToggle;
