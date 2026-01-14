
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/site-content";
import { z } from "zod";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(testimonials);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = testimonialSchema.parse(body);

        const testimonial = await prisma.testimonial.create({
            data: validatedData,
        });

        return NextResponse.json(testimonial, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
    }
}
