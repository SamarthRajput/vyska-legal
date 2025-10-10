import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <Navbar />
            <div className="h-15"></div>
            {children}
            <Footer />
        </div>
    );
}
