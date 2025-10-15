/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAppointmentAndBookSlot } from "@/lib/helper/bookSlot";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Please provide Razorpay credentials in .env.local file");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 401 });
        }

        const { paymentFor, serviceId, description, agenda, slotId, appointmentTypeId } = await request.json();

        if (!paymentFor) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        if (!["APPOINTMENT", "SERVICE"].includes(paymentFor)) {
            return NextResponse.json({ success: false, message: "Invalid paymentFor value" }, { status: 400 });
        }

        let appointment = null;
        let payment = null;
        let amountNumber = 0;

        if (paymentFor === "APPOINTMENT") {
            let result;
            try {
                result = await createAppointmentAndBookSlot({
                    agenda,
                    slotId,
                    userId: user.id,
                    appointmentTypeId,
                    createPayment: true,
                });
            } catch (err: any) {
                // If error object has status/message, forward them
                if (err && typeof err === "object" && "status" in err && "message" in err) {
                    return NextResponse.json(
                        { success: false, message: err.message },
                        { status: err.status }
                    );
                }
                // Fallback for unknown errors
                return NextResponse.json(
                    { success: false, message: "Failed to create appointment/payment" },
                    { status: 500 }
                );
            }

            appointment = result.appointment;
            payment = result.payment;

            if (!appointment || !payment) {
                return NextResponse.json({ success: false, message: "Failed to create appointment/payment" }, { status: 500 });
            }

            // Calculate amount
            amountNumber = typeof appointment.appointmentType.price === "object"
                && typeof appointment.appointmentType.price.toNumber === "function"
                ? appointment.appointmentType.price.toNumber()
                : Number(appointment.appointmentType.price);
        }

        if (amountNumber <= 0) {
            return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(amountNumber * 100), // convert rs to paisa
            currency: "INR",
            notes: {
                paymentFor,
                userId: user.id,
                appointmentId: appointment?.id || "",
                serviceId: serviceId || "",
            },
            receipt: `receipt_${Date.now()}`,
            payment_capture: true,
        });

        // Update payment with Razorpay orderId
        await prisma.payment.update({
            where: { id: payment!.id },
            data: { orderId: order.id },
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            paymentId: payment!.id,
        });

    } catch (error) {
        console.error("Payment Order Error:", error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
