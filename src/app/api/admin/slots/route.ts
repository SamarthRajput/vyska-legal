// src/app/api/admin/slots/route.ts
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const slots = await prisma.appointmentSlot.findMany({
            include: { Appointment: true },
            orderBy: { date: "asc" },
        });
        return NextResponse.json(slots);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const body = await request.json();
        const { startDate, endDate, timeSlots } = body;

        if (!startDate || !endDate || !Array.isArray(timeSlots) || timeSlots.length === 0) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const slotsToCreate = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            for (const time of timeSlots) {
                slotsToCreate.push({
                    date: new Date(d),
                    timeSlot: time,
                    isBooked: false,
                });
            }
        }

        const created = await prisma.appointmentSlot.createMany({
            data: slotsToCreate,
            skipDuplicates: true,
        });

        return NextResponse.json({ message: "Slots created successfully", created: created.count });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
