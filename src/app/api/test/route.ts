import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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
    return NextResponse.json({
        message: "Test API is working!",
        deletedAppointments: appointments,
        deletedPayments: payments,
        deletedTransactions: transactions,
    }, { status: 200 });
}