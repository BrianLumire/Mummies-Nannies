"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import Image from "next/image";

const EnterOtp = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // 6-digit OTP state
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState("");

  // Extract email from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email") || "";
    setEmail(emailParam);
  }, []);

  // Update OTP digit and move focus if necessary
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length > 1) return; // Only allow one digit per input
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    if (value && index < otpValues.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace: if current input is empty, move focus to previous input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // When user clicks Proceed, verify that all 6 digits are entered and then verify OTP
  const handleProceed = async () => {
    const otp = otpValues.join("");
    if (otp.length < 6) {
      toast.error("Please enter a complete 6-digit OTP.");
      return;
    }
    // Ensure email is provided
    if (!email) {
      toast.error("No email provided. Please restart the reset process.");
      router.push("/auth/admin/login/recover-password"); // Adjust as needed
      return;
    }
    setIsLoading(true);
    try {
      // Create a new Supabase client instance
      const supabase = createClient();
      // For numeric OTP recovery, pass the email and the OTP as the token.
      const { data, error } = await supabase.auth.verifyOtp({
        email,        // The user's email
        token: otp,   // The OTP code entered by the user
        type: "recovery",
      });
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      toast.success("OTP verified successfully!");
      // Now that a session is established, redirect to the create-password page
      router.push("/auth/admin/login/create-password");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("OTP verification failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#FAFAFA]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white flex flex-col px-6 py-7 md:w-[40%] w-[80%] sm:w-[60%] shadow-md border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300"
        >
          <motion.div
            className="flex mb-5 flex-col items-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/admin-assets/nanies-icon.svg"
              alt="Nannies Icon"
              className="w-[45px] h-[45px] hover:scale-105 transition-transform duration-200"
            />
            <span className="mb-4 font-medium text-[#6000DA] font-lemon text-lg hover:text-[#4a00ae] transition-colors duration-200">
              Nannies
            </span>
            <span className="font-medium text-base font-sans">Recover Password</span>
            <span className="text-sm text-gray-600 text-center mt-2">
              Enter the PIN code sent to your email
            </span>
          </motion.div>
          <div className="flex justify-center mb-16">
            <div className="flex space-x-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={otpValues[index]}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className="w-10 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6000DA]"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={handleProceed}
              disabled={isLoading}
              className="px-9 py-2 mb-9 w-full text-white font-sans text-sm rounded-lg bg-[#6000DA] relative overflow-hidden group hover:bg-[#4a00ae] active:bg-[#3a0088] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span className="relative z-10">Proceed</span>
              )}
            </button>
            <span className="text-[#909090] pb-3 font-sans text-xs cursor-pointer">
              © 2025 | Copyright - Nannies
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-[url('/admin-assets/bg-pic.svg')] bg-cover bg-center hidden md:block relative">
        <div className="absolute flex flex-col items-center justify-center inset-0 bg-gradient-to-r from-[#440397] to-[#1A013A63] opacity-60">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col w-[80%]"
          >
            <p className="font-barlow text-2xl text-white font-semibold mx-3 max-w-[270px]">
              Manage all Operations in One Place
            </p>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-end mx-3 mb-3"
            >
              <div className="rounded-lg p-2 gap-2 flex items-center bg-[#ffffffda] hover:bg-white transition-colors duration-200">
                <img
                  src="/admin-assets/profile1.svg"
                  alt=""
                  className="object-cover w-8 h-8 rounded-full"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-sans">I.am Wangari</p>
                  <span className="text-[10px]">Online</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-2 items-center mx-3 mb-3"
            >
              <div className="bg-[#ffffffda] w-1/2 rounded-lg p-3 gap-2 flex items-center hover:bg-white transition-colors duration-200">
                <img
                  src="/admin-assets/document.svg"
                  alt=""
                  className="object-cover w-8 h-8 p-1 bg-[#6000DA12] rounded-lg"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-sans font-semibold">+ 34</p>
                  <span className="text-[10px]">Hired Nannies</span>
                </div>
              </div>
              <div className="bg-[#ffffffda] w-1/2 rounded-lg p-3 gap-2 flex items-center hover:bg-white transition-colors duration-200">
                <img
                  src="/admin-assets/onboard.svg"
                  alt=""
                  className="object-cover w-8 h-8 p-1 bg-[#6000DA12] rounded-lg"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-sans font-semibold">+ 42</p>
                  <span className="text-[10px]">Nannies Onboarded</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center"
            >
              <div className="bg-[#ffffffda] w-[65%] rounded-lg p-2 gap-2 flex flex-col hover:bg-white transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <img
                      src="/admin-assets/profile2.svg"
                      alt=""
                      className="object-cover w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-sans font-semibold">Sharon Wanjiku</p>
                      <span className="text-[10px]">Received 32 min ago</span>
                    </div>
                  </div>
                  <button className="border border-[#6000DA] flex items-center rounded-lg px-6 py-[3px] hover:bg-[#6000DA] hover:text-white transition-all duration-200">
                    <span className="text-[#6000DA] text-xs hover:text-inherit">Accept</span>
                  </button>
                </div>
                <div className="flex flex-col gap-1 pl-10">
                  <p className="text-xs font-sans font-semibold">Salary offer: Ksh 15,000</p>
                  <span className="text-[10px]">That is the best I can do.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnterOtp;
