"use client";

import React from "react";
import { Menu } from "lucide-react";

interface TopNavbarProps {
  loggedInUser: { name: string; email: string; imageUrl: string };
  currentPageTitle: string;
  currentPageDescription: string;
  onMobileMenuToggle: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  loggedInUser,
  currentPageTitle,
  currentPageDescription,
  onMobileMenuToggle,
}) => {
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

        {/* User Info (no dropdown) */}
        <div className="hidden sm:flex items-center space-x-3">
          <img
            src={loggedInUser.imageUrl || "/default-profile.png"}
            alt={loggedInUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">{loggedInUser.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
