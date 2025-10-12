/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/admin/slots/route.ts
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // took url query params
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }
        // get query params
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "100", 10);
        const page = parseInt(searchParams.get("page") || "1", 10);
        let show = (searchParams.get("show") || "all");
        let when = (searchParams.get("when") || "all");
        // if show is not of type showFilter, set to 'all'
        if (!["all", "booked", "available"].includes(show)) show = "all";
        if (!["all", "upcoming", "past"].includes(when)) when = "all";

        const offset = (page - 1) * limit;

        // Build filter conditions
        const now = new Date();
        const where: any = {};

        if (when === "upcoming") {
            where.date = { gte: now };
        } else if (when === "past") {
            where.date = { lt: now };
        }
        if (show === "booked") {
            where.isBooked = true;
        } else if (show === "available") {
            where.isBooked = false;
        }

        // fetch slots with filters
        const slots = await prisma.appointmentSlot.findMany({
            where,
            include: { Appointment: true },
            orderBy: { date: "asc" },
            skip: offset,
            take: limit,
        });

        const pagination = {
            page,
            limit,
            total: await prisma.appointmentSlot.count({ where }),
        }
        return NextResponse.json({ slots, pagination });
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

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }
        const { searchParams } = new URL(request.url);
        const slotId = searchParams.get("id");
        if (!slotId) {
            return NextResponse.json({ error: "Missing slotId" }, { status: 400 });
        }

        const deleted = await prisma.appointmentSlot.deleteMany({
            where: { id: slotId },
        });

        return NextResponse.json({ message: "Slots deleted successfully", deleted: deleted.count });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}