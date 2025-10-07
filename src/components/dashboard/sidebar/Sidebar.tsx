"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Menu, X, PenTool } from "lucide-react";
import { navItems, adminNavItems } from "./navItems";

interface SidebarProps {
  loggedInUser: { name: string; email: string; imageUrl: string };
  isAdminRoute: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  loggedInUser,
  isAdminRoute,
  isCollapsed,
  onToggle,
  isMobile,
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const menuItems = isAdminRoute ? adminNavItems : navItems;

  const SidebarContent = (
    <>
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-slate-200",
          isCollapsed && !isMobile && "justify-center"
        )}
      >
        <div
          className="flex flex-row items-center space-x-3 select-none cursor-pointer justify-center w-full"
          onClick={() => router.push("/")}
          title="Go to Home Page"
        >
          {!isCollapsed && (
            <>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Vyaska Legal</h1>
                <p className="text-xs text-slate-500">
                  {isAdminRoute ? "Admin" : "User"} Dashboard
                </p>
              </div>
            </>
          )}
        </div>
        <button
          onClick={isMobile ? onClose : onToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
        {menuItems.map(({ href, icon: Icon, title, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                active
                  ? "bg-sky-100 text-sky-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? title : undefined}
            >
              <Icon className={cn("w-5 h-5", active && "text-sky-600")} />
              {!isCollapsed && <span className="ml-3 font-medium">{title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
          {loggedInUser.imageUrl ? (
            <img
              src={loggedInUser.imageUrl}
              alt={loggedInUser.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-sky-500 rounded-full">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{loggedInUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{loggedInUser.email}</p>
          </div>
        </div>
      </div>
    </>
  );

  return isMobile ? (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 block sm:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white z-50 shadow-xl transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {SidebarContent}
      </aside>
    </>
  ) : (
    <aside
      className={cn(
        "hidden md:block fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {SidebarContent}
    </aside>
  );
};

export default Sidebar;
