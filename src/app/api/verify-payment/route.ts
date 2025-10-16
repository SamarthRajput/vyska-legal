// src/app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createGoogleMeetLink } from "@/utils/googleMeet";

export async function POST(request: NextRequest) {
    try {
        const { orderId, paymentId, signature } = await request.json();

        if (!orderId || !paymentId || !signature) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ success: false, message: "Razorpay Key Secret not found" }, { status: 400 });

        // Verify Razorpay Signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");
        if (generatedSignature !== signature) {
            throw new Error("Invalid Signature");
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const payment = await tx.payment.update({
                where: { orderId: orderId },
                data: {
                    paymentId,
                    signature,
                    status: "SUCCESS",
                },
            });

            await tx.transaction.create({
                data: {
                    paymentId: payment.id,
                    eventType: 'PAYMENT_SUCCESS',
                    rawData: { paymentId: payment.id, signature, message: `Payment verified successfully for booking with paymentId: ${payment.id}` },
                },
            });

            await tx.appointment.updateMany({
                where: { payment: { id: payment.id } },
                data: { status: "CONFIRMED" },
            });
        });
        // Create Calendar Event here and send email to user with details
        const appointment = await prisma.appointment.findFirst({
            where: { payment: { orderId: orderId } },
            include: { slot: true, User: true, appointmentType: true },
        });
        if (!appointment) throw new Error("Appointment not found for this payment");

        // Parse timeSlot "HH:MM-HH:MM" and combine with slot.date
        const [startTimeStr, endTimeStr] = appointment.slot.timeSlot.split('-');
        const slotDate = appointment.slot.date;
        const [startHour, startMinute] = startTimeStr.split(':').map(Number);
        const [endHour, endMinute] = endTimeStr.split(':').map(Number);

        const startDateTime = new Date(slotDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);

        const endDateTime = new Date(slotDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);

        const eventLink = await createGoogleMeetLink(
            appointment.appointmentType.title,
            appointment.appointmentType.description || appointment.agenda || 'No Description',
            startDateTime.toISOString(),
            endDateTime.toISOString(),
            appointment.User?.email || ''
        );
        console.log('Google Meet Link:', eventLink);
        // Save meet link to appointment
        await prisma.appointment.update({
            where: { id: appointment.id },
            data: { meetUrl: eventLink },
        });
        return NextResponse.json({
            success: true,
            message: "Payment Verified Successfully",
        }, { status: 200 });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({
            success: false,
            message: `Payment Verification Error, if you have paid and still seeing this error, please contact support`
        }, { status: 500 });
    }
}