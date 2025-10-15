import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const appointmentTypes = await prisma.appointmentType.findMany({
            orderBy: { createdAt: "desc" },
        });
        return new Response(JSON.stringify({
            appointmentTypes,
            success: true,
            message: "Appointment types fetched successfully"
        }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}