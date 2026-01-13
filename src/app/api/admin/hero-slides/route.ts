
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { heroSlideSchema } from "@/lib/validations/site-content";
import { z } from "zod";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(slides);
    } catch (error) {
        console.error("Failed to fetch slides:", error);
        return NextResponse.json({ error: "Failed to fetch slides" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = heroSlideSchema.parse(body);

        const slide = await prisma.heroSlide.create({
            data: validatedData,
        });

        return NextResponse.json(slide, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create slide" }, { status: 500 });
    }
}
