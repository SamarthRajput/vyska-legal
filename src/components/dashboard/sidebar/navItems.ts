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
    href: "/user",
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
  {
    title: "Profile & Settings",
    description: "Manage your profile settings and preferences.",
    href: "/user/profile",
    icon: Settings,
  },
  {
    title: "Help / Tips",
    description: "Access help resources and useful tips for using the dashboard.",
    href: "/user/help",
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
  // {
  //   title: "Team Members",
  //   description: "Manage team member data that appears on the website.",
  //   icon: FileText,
  //   href: "/admin/team-members",
  // },
  // {
  //   title: "Services Management",
  //   description: "Services provided by the firm.",
  //   href: "/admin/services",
  //   icon: Tags,
  // },
  {
    title: "Research Library",
    description: "Access and moderate uploaded research files.",
    href: "/admin/research",
    icon: ImageIcon,
  },
  {
    title: "Appointment Management",
    description: "Oversee all appointments scheduled on the platform.",
    href: "/admin/appointments-overview",
    icon: Bell,
  },
  {
    title: "Appointment Section",
    description: "Create slots, review availability, and manage bookings.",
    href: "/admin/appointments-section",
    icon: MessageSquareWarning,
  },
  {
    title: "Appointment Type Management",
    description: "Create, update, and manage appointment types.",
    href: "/admin/appointment-types",
    icon: Bookmark,
  },
  {
    title: "Transactions Logs",
    description: "View and manage all payment transactions made on the platform.",
    href: "/admin/transactions",
    icon: BarChart3,
  },
  {
    title: "Contact Us Messages",
    description: "View and respond to messages submitted via the Contact Us form.",
    href: "/admin/contact-us",
    icon: MessageSquareWarning,
  },
  {
    title: "Global Settings",
    description: "Manage website content and settings.",
    href: "#",
    icon: Settings,
    children: [
      {
        title: "Hero Carousel",
        href: "/admin/hero-slides",
        icon: ImageIcon,
      },
      {
        title: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageSquareWarning,
      },
      {
        title: "FAQs",
        href: "/admin/faqs",
        icon: HelpCircle,
      },
      {
        title: "Company Info",
        href: "/admin/company-info",
        icon: Settings,
      },
      {
        title: "Services",
        href: "/admin/services",
        icon: Tags,
      },
      {
        title: "Team Members",
        href: "/admin/team-members",
        icon: FileText,
      },
    ]
  },
];