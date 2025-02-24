"use client";

import { X } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import LoadingAnimation from '@/components/shared/LoadingAnimation';

interface SidebarProps {
    isMobileSidebarOpen: boolean;
    toggleMobileSidebar: () => void;
    isCollapsed: boolean;
}

export const AdminSidebar = ({
    isMobileSidebarOpen,
    toggleMobileSidebar,
    isCollapsed,
}: SidebarProps) => {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState(pathname);

    const navItems = [
        { icon: "/admin-assets/nany1-icon.svg", text: "Nannies", href: "/admin/nannies" },
        { icon: "/admin-assets/mumy-icon.svg", text: "Mummies", href: "/admin/mummies" },
        { icon: "/admin-assets/offer-icon.svg", text: "Offers", href: "/admin/offers" },
        { icon: "/admin-assets/finance-icon.svg", text: "Finances", href: "/admin/finances" },
    ];

    useEffect(() => {
        // Reset loading state when path changes
        if (pathname !== currentPath) {
            setIsLoading(false);
            setCurrentPath(pathname);
        }
    }, [pathname, currentPath]);

    const handleNavigation = () => {
        setIsLoading(true);
        toggleMobileSidebar();
    };

    return (
        <div className="flex h-screen">
            {isLoading && (
                <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm">
                    <LoadingAnimation />
                </div>
            )}

<div
        className={`transition-all duration-300 w-full fixed md:relative h-full md:block z-40 pb-6 ${isCollapsed ? "md:w-12" : "md:w-32"} ${isMobileSidebarOpen ? "block" : "hidden"} bg-[#200147] text-white flex flex-col items-center`}
      >
        <div className="flex justify-end p-2 w-full">
          <button
            onClick={toggleMobileSidebar}
            className="text-white md:hidden focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

                <nav className="flex flex-col gap-3  w-full">
                    <div className="flex flex-col items-center mb-2">
                        <Image src="/admin-assets/nanny-icon.svg" alt="Nanny Icon" width={20} height={20} />
                        <span className="text-xs mt-1 font-lemon">{isCollapsed ? "" : "Nannies"}</span>
                    </div>
                    <hr className="border-t border-white  w-full" />

                    {navItems.map((item) => (
                        <Link 
                            key={item.text} 
                            href={item.href} 
                            className="flex flex-col items-center w-full"
                            onClick={handleNavigation}
                        >
                            <div className={`flex flex-col items-center p-2  w-full hover:bg-[#FFFFFF33] transition-colors duration-200 ${pathname === item.href ? 'bg-[#FFFFFF33]' : ''}`}>
                                <Image src={item.icon} alt={item.text} width={20} height={20} />
                                <span className="text-xs mt-1">{isCollapsed ? "" : item.text}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>

            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}
        </div>
    );
};