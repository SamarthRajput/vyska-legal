import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs'
import Script from "next/script";
import DisclaimerModal from "@/components/DisclaimerModal";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
})



export const metadata: Metadata = {
  title: "Vyska Legal",
  description: "Vyska Legal - Your trusted legal resources and services app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companyInfo = await prisma.companyInfo.findFirst();

  return (
    <html lang="en" className={lato.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className="font-lato"
      >
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <ClerkProvider>
          <DisclaimerModal
            message={companyInfo?.disclaimerMessage}
            points={companyInfo?.disclaimerPoints}
          />
          <Toaster />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
