import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST to create an appointment for a slot
export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 403 });
        }

        const body = await request.json();
        const { agenda, slotId, userId, phone } = body;

        if (!slotId) {
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
                    userName: user.name!,
                    userEmail: user.email!,
                    userPhone: phone || null,
                    agenda,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: "PENDING",
                    User: { connect: { id: user.id } },
                    slot: { connect: { id: slotId } },
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

// GET to fetch user's appointments
export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 403 });
        }
        const appointments = await prisma.appointment.findMany({
            where: { userId: user.id },
            include: { slot: true },
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
                        status: "PENDING", // Reset status to PENDING on slot change
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