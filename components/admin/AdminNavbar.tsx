"use client";

import { Menu, PanelLeftOpen, PanelLeftClose, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/supabase/client"; 
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NavbarProps {
  toggleMobileSidebar: () => void;
  toggleCollapse: () => void;
  isCollapsed: boolean;
}


export const AdminNavbar = ({
  toggleMobileSidebar,
  toggleCollapse,
  isCollapsed,
}: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Logged out successfully!", {
        position: "top-center",
        duration: 2000,
      });
      router.push("/auth/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.", {
        position: "top-center",
        duration: 3000,
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
      <div className="md:pt-5 border-b justify-between pt-2 md:mb-3 flex items-center sticky top-0 z-20 pb-3 bg-background">
          {/* Left Section - Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={toggleMobileSidebar}
              className="text-foreground md:hidden focus:outline-none"
            >
              <Menu size={24} />
            </button>
    
            <button
              onClick={toggleCollapse}
              className="hidden md:block text-foreground focus:outline-none"
            >
              {isCollapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>
            <div className="hidden md:block">
            <p className="text-xs font-barlow">Good Morning, Wangari</p>
            <span className="text-xs font-barlow text-gray-500">February 7th 2025</span>
            </div>
          </div>
    
          {/* Right Section - Empty for custom content */}
          <div className="flex items-center gap-4 md:pr-3">
    
            <button className="flex items-center gap-2 py-2 px-3 border rounded-lg">
            <Image src="/admin-assets/settings-icon.svg" alt="" width={14} height={14}/>
            <span className="text-[10px] font-bold font-sans">Settings</span>
            </button>
            
    
          

      {/* Profile Dropdown Area */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="rounded-lg gap-2 flex items-center bg-[#ffffffda] hover:bg-white transition-colors duration-200 pr-2"
        >
          <img
            src="/admin-assets/profile1.svg"
            alt=""
            className="object-cover w-8 h-8 rounded-full"
          />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-sans">I.am Wangari</p>
            <div className="flex items-center relative justify-start w-[40%]">
              <span className="text-[10px]">Online</span>
              <div className="absolute -top-[2px] -right-2 w-[5px] h-[5px] flex items-center justify-center rounded-full bg-green-500"></div>
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border z-30"
          >
            <button
              onClick={() => {
                setShowLogoutModal(true);
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-barlow font-semibold text-[#6000DA]">Log Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold font-barlow mb-4">
          Are you sure you want to log out?
        </h3>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            disabled={isLoggingOut}
            className="px-4 py-2 text-sm font-barlow text-[#6000DA] font-medium hover:bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-sm font-barlow font-medium text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isLoggingOut && (
              <svg
                className="animate-spin h-4 w-4 text-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            Log Out
          </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};