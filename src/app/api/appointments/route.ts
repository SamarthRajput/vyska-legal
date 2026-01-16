/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUser } from "@/lib/getUser";
import { createAppointmentAndBookSlot } from "@/lib/helper/bookSlot";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "@/lib/validations/appointment";
import { NextRequest, NextResponse } from "next/server";

// POST to create an appointment for a slot
export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 403 });
        }

        const body = await request.json();

        // Validate with Zod
        const result = createAppointmentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: result.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { agenda, slotId, appointmentTypeId, userId, phone } = result.data;

        let appointment;
        try {
            appointment = await createAppointmentAndBookSlot({
                agenda,
                slotId,
                userId,
                phone,
                appointmentTypeId
            });
        } catch (err: any) {
            return NextResponse.json({ error: err.message || "Error" }, { status: err.status || 500 });
        }

        return NextResponse.json({ message: "Appointment created", appointment });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// GET to fetch user's appointments
export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 403 });
        }
        const appointments = await prisma.appointment.findMany({
            where: { userId: user.id },
            include: { slot: true, payment: true, appointmentType: true },
            orderBy: { slot: { date: "desc" } },
        });

        return NextResponse.json({ appointments });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE to cancel an appointment
export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 403 });
        }
        const body = await request.json();
        const appointmentId = body.id;
        if (!appointmentId) {
            return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
        }
        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }
        if (appointment.userId !== user.id) {
            return NextResponse.json({ error: "You can only cancel your own appointments" }, { status: 403 });
        }
        // Delete appointment and mark slot as not booked in a transaction
        await prisma.$transaction([
            prisma.appointment.delete({ where: { id: appointmentId } }),
            prisma.appointmentSlot.update({
                where: { id: appointment.slotId },
                data: { isBooked: false },
            }),
        ]);
        return NextResponse.json({ message: "Appointment cancelled" });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH to update appointment status or slot time
export async function PATCH(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 403 });
        }
        const body = await request.json();
        const { appointmentId, newSlotId } = body;
        if (!appointmentId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }
        if (appointment.userId !== user.id) {
            return NextResponse.json({ error: "You can only update your own appointments" }, { status: 403 });
        }

        // Limit reschedules to maxReschedules
        if (appointment.rescheduleCount >= appointment.maxReschedules) {
            return NextResponse.json({ error: `Reschedule limit reached, you can only reschedule ${appointment.maxReschedules} times` }, { status: 400 });
        }

        let updatedAppointment;

        // Change slot time if newSlotId is provided
        if (newSlotId && newSlotId !== appointment.slotId) {
            // Check if new slot exists and is not booked
            const newSlot = await prisma.appointmentSlot.findUnique({ where: { id: newSlotId } });
            if (!newSlot) {
                return NextResponse.json({ error: "New slot not found" }, { status: 404 });
            }
            if (newSlot.isBooked) {
                return NextResponse.json({ error: "New slot already booked" }, { status: 400 });
            }
            // Update appointment to new slot and mark slots accordingly
            const [updated, _newSlot, _oldSlot] = await prisma.$transaction([
                prisma.appointment.update({
                    where: { id: appointmentId },
                    data: {
                        slotId: newSlotId,
                        status: "CONFIRMED",
                        rescheduleCount: appointment.rescheduleCount + 1,
                        updatedAt: new Date(),
                    },
                }),
                prisma.appointmentSlot.update({
                    where: { id: newSlotId },
                    data: { isBooked: true },
                }),
                prisma.appointmentSlot.update({
                    where: { id: appointment.slotId },
                    data: { isBooked: false },
                }),
            ]);
            updatedAppointment = updated;
        } else {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }

        return NextResponse.json({ message: "Appointment updated", appointment: updatedAppointment });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}