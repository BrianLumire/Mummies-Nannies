"use client";
import React from "react";
import { createClient } from "@/supabase/client";

const supabase = createClient();

const TestNannyUserAccountButton = () => {
  const handleClick = async () => {
    const payload = {

      phone_number: "+1264567890", 
    };

    try {
      const { data, error } = await supabase.functions.invoke("create_nanny_user_account", {
        body: payload,
      });

      if (error) {
        console.error("Error creating nanny user account:", error);
      } else {
        console.log("Response from create_nanny_user_account:", data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "8px 16px",
        backgroundColor: "#6000DA",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Test Create Nanny User Account
    </button>
  );
};

export default TestNannyUserAccountButton;
