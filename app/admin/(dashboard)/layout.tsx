"use client";
import { useState } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar"; 
import {AdminNavbar} from "@/components/admin/AdminNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle functions
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
        isCollapsed={isCollapsed}
        
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden mx-2 ">
        {/* Navbar */}
        <AdminNavbar
          toggleMobileSidebar={toggleMobileSidebar}
          toggleCollapse={toggleCollapse}
          isCollapsed={isCollapsed}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto ">
          {children}
        </div>
      </div>
    </div>
  );
}