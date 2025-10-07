"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { adminNavItems, navItems } from "../sidebar/navItems";
import Sidebar from "../sidebar/Sidebar";
import TopNavbar from "../navbar/TopNavbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState({
    name: "",
    email: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (user) {
      setLoggedInUser({
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl || "",
      });
    }
  }, [user]);

  useEffect(() => {
    setIsAdminRoute(pathname.startsWith("/admin"));
  }, [pathname]);

  const currentPage =
    (isAdminRoute
      ? adminNavItems.find((i) =>
          i.exact ? i.href === pathname : pathname.startsWith(i.href)
        )
      : navItems.find((i) => pathname.startsWith(i.href))) ?? {
      title: "Dashboard",
      description: "Manage your content and settings.",
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50 relative">
      {/* Sidebar */}
      <Sidebar
        loggedInUser={loggedInUser}
        isAdminRoute={isAdminRoute}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={false}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <Sidebar
        loggedInUser={loggedInUser}
        isAdminRoute={isAdminRoute}
        isCollapsed={false}
        onToggle={() => {}}
        isMobile={true}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300 relative",
          "md:ml-64",
          isSidebarCollapsed && "md:ml-16"
        )}
      >
        <TopNavbar
          loggedInUser={loggedInUser}
          currentPageTitle={currentPage.title}
          currentPageDescription={currentPage.description}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          onLogout={() => {
            signOut({ redirectUrl: "/" });
            toast.success("Logged out successfully");
          }}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
