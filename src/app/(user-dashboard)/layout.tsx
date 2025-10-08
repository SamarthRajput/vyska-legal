import { getCurrentUser } from "@/actions/syncUser";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import ShowError from "@/components/ShowError";


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    
    const user = await getCurrentUser();

    // Check if user exists and is user 
    if(!user || user.role !== 'USER'){
        return <ShowError message="Access Denied. You must be signed in to view this page" ></ShowError>
    }

    return (
        <div>
            <DashboardLayout>{children}</DashboardLayout>
        </div>
    );
}
