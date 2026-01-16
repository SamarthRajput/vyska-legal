// src/app/api/appointment-type/route.ts
import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function isValidString(value: unknown, min = 1, max = Infinity) {
    return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function isValidNumber(value: unknown) {
    return typeof value === "number" && !Number.isNaN(value) && value >= 0;
}

export async function GET(request: NextRequest) {
    try {
        // read query param 'activeOnly' to filter active appointment types
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get("activeOnly");
        // if true, fetch only active appointment types else fetch all
        const activeOnlyBool = activeOnly === "true" ? true : false;

        const appointmentTypes = await prisma.appointmentType.findMany({
            where: { isActive: activeOnlyBool ? true : undefined },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({
            success: true,
            message: "Appointment types fetched successfully",
            appointmentTypes,
        });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { 
            title, 
            subTitle,
            description, 
            price, 
            isActive 
        } = await request.json();
        if (!isValidString(title, 1, 100) || !isValidString(description, 1, 1000) || !isValidNumber(price) || typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }
        if (subTitle !== undefined && subTitle !== null && !isValidString(subTitle, 1, 100)) {
            return NextResponse.json({ error: "Invalid sub-appointment" }, { status: 400 });
        }

        const appointmentType = await prisma.appointmentType.create({
            data: { 
                title: title.trim(), 
                subTitle: subTitle ? subTitle.trim() : null, 
                description: description.trim(),
                price, 
                isActive 
            },
        });

        return NextResponse.json({
            success: true,
            message: "Appointment type created successfully",
            appointmentType,
        });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { id, title, subTitle, description, price, isActive } = await request.json();
        if (!isValidString(id) || !isValidString(title, 1, 100) || !isValidString(description, 1, 1000) || !isValidNumber(price) || typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }

        const appointmentType = await prisma.appointmentType.update({
            where: { id },
            data: { 
                title: title.trim(), 
                subTitle: subTitle.trim(),
                description: description.trim(), 
                price, 
                isActive 
            },
        });

        return NextResponse.json({
            success: true,
            message: "Appointment type updated successfully",
            appointmentType,
        });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { id } = await request.json();
        if (!isValidString(id)) {
            return NextResponse.json({ error: "Invalid appointment type ID" }, { status: 400 });
        }

        // find if any appointments exist with this appointment type
        const existingAppointments = await prisma.appointment.findFirst({
            where: { appointmentTypeId: id },
        });
        if (existingAppointments) {
            await prisma.appointmentType.update({
                where: { id },
                data: { isActive: false },
            });
        } else {
            await prisma.appointmentType.delete({
                where: { id },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Appointment type deleted successfully",
        });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
