/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/admin/slots/route.ts
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Access Denied. Please log in." }, { status: 403 });
        }

        // get query params
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "100", 10);
        const page = parseInt(searchParams.get("page") || "1", 10);
        let show = (searchParams.get("show") || "all");
        let when = (searchParams.get("when") || "all");
        const date = searchParams.get("date"); // YYYY-MM-DD

        // if show is not of type showFilter, set to 'all'
        if (!["all", "booked", "available"].includes(show)) show = "available";
        if (!["all", "upcoming", "past"].includes(when)) when = "upcoming";

        const offset = (page - 1) * limit;

        // Build filter conditions
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to start of today
        const where: any = {};

        if (date) {
            // Compare only the date part
            const inputDate = new Date(`${date}T00:00:00`);
            inputDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(inputDate);
            nextDate.setDate(inputDate.getDate() + 1);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (inputDate < today) {
                return NextResponse.json({
                    slots: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                });
            }
            // Use range to match only the date part
            where.date = { gte: inputDate, lt: nextDate };
        } else if (when === "upcoming") {
            // All slots from today onwards (date only)
            where.date = { gte: now };
        } else if (when === "past") {
            // All slots before today (date only)
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
            include: { Appointment: false },
            orderBy: date
                ? { timeSlot: "asc" }
                : { date: "asc" },
            skip: offset,
            take: limit,
        });

        const pagination = {
            page,
            limit,
            total: await prisma.appointmentSlot.count({ where }),
        }
        console.log(`Total ${slots.length} slots found\nWhere: ${JSON.stringify(where)}`);
        return NextResponse.json({ slots, pagination });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}
