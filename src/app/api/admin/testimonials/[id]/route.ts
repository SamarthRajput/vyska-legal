
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/site-content";
import { z } from "zod";
import { getUser } from "@/lib/getUser";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const validatedData = testimonialSchema.partial().parse(body);

        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json(testimonial);
    } catch (error) {
        console.error("Testimonial Update Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await prisma.testimonial.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
    }
}
