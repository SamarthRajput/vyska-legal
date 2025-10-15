// src/app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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