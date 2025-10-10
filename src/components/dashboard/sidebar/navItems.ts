import {
  BarChart3,
  BookOpen,
  Bookmark,
  Bell,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  CheckSquare,
  Users,
  MessageSquareWarning,
  FileText,
  Tags
} from "lucide-react";

export const navItems = [
  {
    title: "Overview",
    description: "Get a quick overview of your blog performance and recent activity.",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Analytics",
    description: "Dive deep into your blog analytics and track your growth.",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "My Blogs",
    description: "Manage and edit your blog posts all in one place.",
    href: "/dashboard/blogs",
    icon: BookOpen,
  },
  {
    title: "Media Library",
    description: "Organize and manage your media files efficiently.",
    href: "/dashboard/media",
    icon: ImageIcon,
  },
  {
    title: "Bookmarks",
    description: "Save and manage your favorite blog posts.",
    href: "/dashboard/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Profile & Settings",
    description: "Manage your profile settings and preferences.",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help / Tips",
    description: "Access help resources and useful tips for using the dashboard.",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export const adminNavItems = [
  {
    title: "Admin Overview",
    description: "Quick summary of site activity, pending reviews, and system stats.",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Post Review & Approvals",
    description: "Review, approve, reject, or schedule submitted blog posts.",
    href: "/admin/blogs",
    icon: CheckSquare,
  },
  {
    title: "Team Management",
    description: "Manage users, roles, and site permissions.",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Services Management",
    description: "Services provided by the firm.",
    href: "/admin/services",
    icon: Tags,
  },
  {
    title: "Research Library",
    description: "Access and moderate uploaded research files.",
    href: "/admin/research",
    icon: ImageIcon,
  },
  {
    title: "Appointment Section",
    description: "Create slots, review availability, and manage bookings.",
    href: "/admin/appointment",
    icon: MessageSquareWarning,
  },
  {
    title: "System Settings",
    description: "Configure platform-level preferences and integrations.",
    href: "/admin/settings",
    icon: Settings,
  },
];
