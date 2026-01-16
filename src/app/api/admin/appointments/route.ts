/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {

        const user = await getUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied: administrator privileges required." }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const pageParam = parseInt(searchParams.get("page") || "1", 10);
        const limitParam = parseInt(searchParams.get("limit") || "20", 10);

        const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
        const limit = Number.isNaN(limitParam) || limitParam < 1 || limitParam > 100 ? 20 : limitParam;

        const filter: any = {};

        if (status && ["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
            filter.status = status;
        }

        if (search) {
            filter.OR = [
                { userName: { contains: search, mode: "insensitive" } },
                { agenda: { contains: search, mode: "insensitive" } },
                { userPhone: { contains: search, mode: "insensitive" } },
                { userEmail: { contains: search, mode: "insensitive" } },
            ];
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where: filter,
                include: {
                    slot: true,
                    User: true,
                    appointmentType: true,
                    payment: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.appointment.count({ where: filter }),
        ]);

        return NextResponse.json({
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            appointments,
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: "Internal server error while fetching appointments." }, { status: 500 });
    }
}

// Add or Update Meeting Url / Manage noofrescheduled
export async function PATCH(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied: administrator privileges required." }, { status: 403 });
        }
        const { appointmentId, meetingUrl, incrementReschedule = false, decrementReschedule = false } = await request.json();

        if (!appointmentId) {
            return NextResponse.json({ error: "Missing parameter: 'appointmentId' is required." }, { status: 400 });
        }
        if (incrementReschedule && decrementReschedule) {
            return NextResponse.json({ error: "Invalid request: cannot increment and decrement reschedule count at the same time." }, { status: 400 });
        }
        if (meetingUrl !== undefined && typeof meetingUrl !== "string") {
            return NextResponse.json({ error: "Invalid parameter: 'meetingUrl' must be a string." }, { status: 400 });
        }

        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found for the provided 'appointmentId'." }, { status: 404 });
        }
        const currentMaxReschedules = appointment.maxReschedules || 2;
        if (decrementReschedule) {
            if (currentMaxReschedules <= 0) {
                return NextResponse.json({ error: "Reschedule limit cannot be less than zero." }, { status: 400 });
            }
            if (currentMaxReschedules <= appointment.rescheduleCount) {
                return NextResponse.json({ error: "Cannot decrease limit below the current usage count." }, { status: 400 });
            }
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                meetUrl: meetingUrl || appointment.meetUrl,
                maxReschedules: currentMaxReschedules + (incrementReschedule ? 1 : decrementReschedule ? -1 : 0),
            },
            include: {
                slot: true,
                User: true,
                appointmentType: true,
                payment: true,
            },
        });

        const actions: string[] = [];
        if (meetingUrl !== undefined && meetingUrl !== appointment.meetUrl) actions.push("Meeting URL updated");
        if (incrementReschedule) actions.push("Reschedule count incremented");
        if (decrementReschedule) actions.push("Reschedule count decremented");
        if (actions.length === 0) actions.push("No changes applied");
        const message = `${actions.join("; ")} successfully.`;

        return NextResponse.json({ appointment: updatedAppointment, message });
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({ error: "Internal server error while updating appointment." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied. Please log in as admin." }, { status: 403 });
        }
        const { appointmentId } = await request.json();

        if (!appointmentId) {
            return NextResponse.json({ error: "Appointment ID is required." }, { status: 400 });
        }

        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
        }
        // if appointment status is pending and no payment exists then only the appointment will get delete
        // if payment done then admin can not cancelled the appointment.
        // Only allow deletion when the appointment is still pending.
        if (appointment.status === "CONFIRMED") {
            return NextResponse.json({ error: "Only pending appointments can be deleted." }, { status: 400 });
        }
        // check payment
        const payment = await prisma.payment.findUnique({ where: { appointmentId: appointmentId } });
        if (payment?.status === 'SUCCESS') {
            return NextResponse.json({ error: "Cannot delete appointment with successful payment." }, { status: 400 });
        }
        await prisma.appointment.delete({ where: { id: appointmentId } });

        return NextResponse.json({ message: "Appointment deleted successfully." });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return NextResponse.json({ error: "Internal server error while deleting appointment." }, { status: 500 });
    }
}