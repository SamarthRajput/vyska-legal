
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations/site-content";
import { z } from "zod";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const faqs = await prisma.fAQ.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(faqs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = faqSchema.parse(body);

        const faq = await prisma.fAQ.create({
            data: validatedData,
        });

        return NextResponse.json(faq, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
    }
}
