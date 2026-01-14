
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { companyInfoSchema } from "@/lib/validations/site-content";
import { z } from "zod";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const info = await prisma.companyInfo.findFirst();
        return NextResponse.json(info || {});
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch company info" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Helper: Extract URL from iframe if user pasted full embed code
        if (body.mapUrl && body.mapUrl.includes("<iframe")) {
            const match = body.mapUrl.match(/src="([^"]+)"/);
            if (match && match[1]) {
                body.mapUrl = match[1];
            }
        }

        const validatedData = companyInfoSchema.partial().parse(body);

        const info = await prisma.companyInfo.findFirst();

        let updatedInfo;
        if (info) {
            updatedInfo = await prisma.companyInfo.update({
                where: { id: info.id },
                data: validatedData
            });
        } else {
            updatedInfo = await prisma.companyInfo.create({
                data: {
                    paymentQrCode: "", // We don't have this in schema but just in case
                    ...validatedData,
                    email: validatedData.email || "",
                    phone: validatedData.phone || "",
                    address: validatedData.address || "",
                } as any // Type assertion to bypass strict checks if we are lazy, but better to be safe.
            });
        }

        return NextResponse.json(updatedInfo);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update company info" }, { status: 500 });
    }
}
