import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// import { getGoogleAuthUrl, setGoogleTokens, createGoogleMeetLink } from '@/utils/googleMeet';
export async function GET() {
    try {

        // Step 1: Print auth URL
        // console.log(getGoogleAuthUrl());
        // Visit the printed URL, allow access, and get the `code` from the redirect URL.
        // return NextResponse.redirect(await getGoogleAuthUrl());
        // await setGoogleTokens('4/0AVGzR1BOel8yD0Lx2J5dcX0vDGWTVU9G2HgclORIqDqeCxz4CJiP-4xrT2_evTTHNo003Q');

        // Step 2: Exchange code for tokens
        // await setGoogleTokens('4/0AVGzR1ArICd4XiikUDl5erCAlw60AyeLBhaNb252N2vXGCgi9gfQnBG-J6jK6VrFboun9A');
        // Step 3: Test API by cleaning up all data (appointments, payments, transactions, slots)

        // const link = await createGoogleMeetLink(
        //     'Test Meeting',
        //     'This is a test meeting created via Google Calendar API',
        //     new Date().toISOString(),
        //     new Date(new Date().getTime() + 30 * 60000).toISOString(), // 30 mins later
        //     'bcs220340.rky@goel.edu.in'
        // );
        // console.log('Google Meet Link:', link);
        // 

        return NextResponse.json({
            // link: link,
            message: "Set Google OAuth tokens. Now comment out setGoogleTokens() call and uncomment cleanup code to test API."
        }, { status: 200 });

        return NextResponse.json({ message: "Test API is working!" }, { status: 200 });
        // delete all transactions first (they depend on payments)
        const transactions = await prisma.transaction.deleteMany({});
        console.log("Deleted transactions:", transactions);
        // then delete payments
        const payments = await prisma.payment.deleteMany({});
        console.log("Deleted payments:", payments);
        // then delete appointments
        const appointments = await prisma.appointment.deleteMany({});
        console.log("Deleted appointments:", appointments);
        // delete all slots
        const slots = await prisma.appointmentSlot.deleteMany({});
        console.log("Deleted slots:", slots);
        return NextResponse.json({
            message: "Test API is working!",
            deletedAppointments: appointments,
            deletedPayments: payments,
            deletedTransactions: transactions,
            deletedSlots: slots,
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Server error", message: (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
}