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
    title: "My Blogs",
    description: "Manage and edit your blog posts all in one place.",
    href: "/user/blogs",
    icon: BookOpen,
  },
  {
    title: "Manage Appointments",
    description: "Organize and manage your media files efficiently.",
    href: "/user/manage-appointments",
    icon: ImageIcon,
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
    title: "Team Members",
    description: "Manage team member data that appears on the website.",
    icon: FileText,
    href: "/admin/team-members",
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
    href: "/admin/appointments",
    icon: MessageSquareWarning,
  },
  {
    title: "Contact Us Messages",
    description: "View and respond to messages submitted via the Contact Us form.",
    href: "/admin/contact-us",
    icon: MessageSquareWarning,
  },
];
