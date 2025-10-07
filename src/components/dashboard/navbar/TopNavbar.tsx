"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Settings, ChevronDown, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TopNavbarProps {
  loggedInUser: { name: string; email: string; imageUrl: string };
  currentPageTitle: string;
  currentPageDescription: string;
  onMobileMenuToggle: () => void;
  onLogout: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  loggedInUser,
  currentPageTitle,
  currentPageDescription,
  onMobileMenuToggle,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm sticky top-0 z-20">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-800">
              {currentPageTitle}
            </h2>
            <p className="text-sm text-slate-500">{currentPageDescription}</p>
          </div>
        </div>

        {/* User Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-xl"
          >
            <img
              src={loggedInUser.imageUrl}
              alt={loggedInUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">{loggedInUser.name}</p>
              <p className="text-xs text-slate-500">User</p>
            </div>
            <ChevronDown
              className={cn("w-4 h-4 transition", isOpen && "rotate-180")}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 shadow-lg rounded-xl py-2 z-50">
              <Link
                href="/dashboard/settings"
                className="flex items-center space-x-3 px-4 py-2 hover:bg-sky-50"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                  toast.success("Logged out successfully");
                }}
                className="flex items-center w-full space-x-3 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
