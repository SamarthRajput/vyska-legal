// src/app/api/cancel-payment/route.ts
import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { orderId, reason, metadata } = await request.json();
        if (!orderId)
            return NextResponse.json({ success: false, message: "Missing orderId" }, { status: 400 });

        const payment = await prisma.payment.findUnique({ where: { orderId } });
        if (!payment || payment.userId !== user.id) {
            return NextResponse.json({ success: false, message: "Payment not found or not yours" }, { status: 403 });
        }

        if (payment.status !== "PENDING") {
            return NextResponse.json({ success: false, message: "Only pending payments can be cancelled" }, { status: 400 });
        }
        await prisma.$transaction(async (tx) => {
            // Cancel appointment if exists
            if (payment.appointmentId) {
                const appointment = await tx.appointment.update({
                    where: { id: payment.appointmentId },
                    data: { status: "CANCELLED"},
                    include: { slot: true },
                });

                // Free up the booked slot
                await tx.appointmentSlot.update({
                    where: { id: appointment.slotId },
                    data: { isBooked: false },
                });
            }

            // Mark payment as cancelled
            await tx.payment.update({
                where: { id: payment.id },
                data: { status: "CANCELLED"},
            });

            // Log the cancellation
            await tx.transaction.create({
                data: {
                    paymentId: payment.id,
                    eventType: 'PAYMENT_CANCELLED',
                    rawData: { reason: reason || "Cancelled by user", metadata, message: `Payment cancelled for orderId: ${orderId}` },
                },
            });
        });

        return NextResponse.json({ success: true, message: "Payment cancelled successfully" });
    } catch (error) {
        console.error("Cancel Payment Error:", error);
        return NextResponse.json({ success: false, message: "Failed to cancel payment" }, { status: 500 });
    }
}
