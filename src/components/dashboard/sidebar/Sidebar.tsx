"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Menu, X } from "lucide-react";
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
          isCollapsed && !isMobile && "flex-col space-y-2 justify-center"
        )}
      >
        <div
          className={cn(
            "flex items-center select-none cursor-pointer transition-all duration-200",
            isCollapsed && !isMobile ? "flex-col space-y-1" : "flex-row space-x-3 flex-1"
          )}
          onClick={() => router.push("/")}
          title="Go to Home Page"
        >
          {(!isCollapsed || isMobile) && (
            <>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className={cn(
                  "rounded-lg shadow transition-all",
                  isCollapsed && !isMobile ? "w-8 h-8" : "w-10 h-10"
                )} 
              />
              <div className={cn(isCollapsed && !isMobile && "hidden")}>
                <h1 className="text-xl font-bold text-slate-800 truncate">
                  Vyaska Legal
                </h1>
                <p className="text-xs text-slate-500 truncate">
                  {isAdminRoute ? "Admin" : "User"} Dashboard
                </p>
              </div>
            </>
          )}
          {isCollapsed && !isMobile && (
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-8 h-8 rounded-lg shadow" 
            />
          )}
        </div>
        <button
          onClick={isMobile ? onClose : onToggle}
          className={cn(
            "p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0",
            isCollapsed && !isMobile && "mt-2"
          )}
          aria-label={isMobile ? "Close menu" : isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {menuItems.map(({ href, icon: Icon, title, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                active
                  ? "bg-sky-100 text-sky-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
                isCollapsed && !isMobile && "justify-center px-2"
              )}
              title={isCollapsed && !isMobile ? title : undefined}
              aria-label={title}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                active && "text-sky-600"
              )} />
              {(!isCollapsed || isMobile) && (
                <span className="ml-3 font-medium truncate">{title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-200">
        <div className={cn(
          "flex items-center p-3 bg-slate-50 rounded-xl transition-all",
          isCollapsed && !isMobile ? "flex-col space-y-2" : "space-x-3"
        )}>
          {loggedInUser.imageUrl ? (
            <img
              src={loggedInUser.imageUrl}
              alt={loggedInUser.name}
              className={cn(
                "rounded-full flex-shrink-0",
                isCollapsed && !isMobile ? "w-8 h-8" : "w-10 h-10"
              )}
            />
          ) : (
            <div className={cn(
              "flex items-center justify-center bg-sky-500 rounded-full flex-shrink-0",
              isCollapsed && !isMobile ? "w-8 h-8" : "w-10 h-10"
            )}>
              <User className={cn(
                "text-white",
                isCollapsed && !isMobile ? "w-4 h-4" : "w-5 h-5"
              )} />
            </div>
          )}
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{loggedInUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{loggedInUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return isMobile ? (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out",
          "w-[280px] max-w-[85vw]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        {SidebarContent}
      </aside>
    </>
  ) : (
    // Desktop Sidebar
    <aside
      className={cn(
        "hidden md:flex flex-col fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-30",
        isCollapsed ? "w-20" : "w-64"
      )}
      aria-label="Desktop navigation"
    >
      {SidebarContent}
    </aside>
  );
};

export default Sidebar;
