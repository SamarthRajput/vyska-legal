// app/layout.tsx (server component)
// import { getCurrentUser } from "@/actions/syncUser";
// import ShowError from "@/components/ShowError";

import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const user = await getCurrentUser();

    // // Check if user exists and is admin
    // if (!user || user.siteRole !== "admin") {
    //     return <ShowError message="Access Denied. You must be an admin to view this page." redirectText="Go Back" redirectUrl="/" />
    // }

    return (
        <DashboardLayout>{children}</DashboardLayout>
    );
}
