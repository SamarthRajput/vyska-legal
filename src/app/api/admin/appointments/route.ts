import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { AppointmentStatus, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// POST to create an appointment for a slot
export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const body = await request.json();
        const { userName, userEmail, userPhone, agenda, slotId, userId } = body;

        if (!userName || !userEmail || !slotId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (agenda && typeof agenda !== "string" && agenda.length > 500) {
            return NextResponse.json({ error: "Agenda must be a string up to 500 characters" }, { status: 400 });
        }

        // Check if slot is already booked
        const slot = await prisma.appointmentSlot.findUnique({ where: { id: slotId } });
        if (!slot) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }
        if (slot.isBooked) {
            return NextResponse.json({ error: "Slot already booked" }, { status: 400 });
        }

        // Create appointment and mark slot as booked in a transaction
        const [appointment] = await prisma.$transaction([
            prisma.appointment.create({
                data: {
                    userName,
                    userEmail,
                    userPhone,
                    agenda,
                    slotId,
                    userId,
                    status: "PENDING",
                },
            }),
            prisma.appointmentSlot.update({
                where: { id: slotId },
                data: { isBooked: true },
            }),
        ]);

        return NextResponse.json({ message: "Appointment created", appointment });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE to cancel an appointment
export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }
        const { searchParams } = new URL(request.url);
        const appointmentId = searchParams.get("id");
        if (!appointmentId) {
            return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
        }
        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }
        // Delete appointment
        await prisma.appointment.delete({ where: { id: appointmentId } });
        // Mark slot as not booked
        await prisma.appointmentSlot.update({
            where: { id: appointment.slotId },
            data: { isBooked: false },
        });
        return NextResponse.json({ message: "Appointment cancelled" });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH to update appointment status
export async function PATCH(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }
        const body = await request.json();
        const { appointmentId, status, reason } = body;
        if (!appointmentId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (!Object.values(AppointmentStatus).includes(status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }
        // If status is CANCELLED, reason must be provided
        if (status === "CANCELLED" && !reason) {
            return NextResponse.json({ error: "Cancellation reason is required" }, { status: 400 });
        }
        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }
        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
        });
        return NextResponse.json({ message: "Appointment updated", appointment: updated });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}