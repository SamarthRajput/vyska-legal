import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div>
            <DashboardLayout>{children}</DashboardLayout>
        </div>
    );
}
