/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/getExcerpt";
import { getUser } from "@/lib/getUser";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message, phone, subject } = body;

        if (!name || !email || !message || !subject) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, subject, or message." },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
        }

        if (name.length > 100)
            return NextResponse.json({ error: "Name is too long (max 100 characters)." }, { status: 400 });

        if (subject.length > 150)
            return NextResponse.json({ error: "Subject is too long (max 150 characters)." }, { status: 400 });

        if (message.length > 2000)
            return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });

        if (phone && phone.length > 20)
            return NextResponse.json({ error: "Phone number is too long (max 20 characters)." }, { status: 400 });

        const contact = await prisma.contact.create({
            data: { name, email, phone, subject, message },
        });

        return NextResponse.json(
            {
                message: "Contact form submitted successfully.",
                data: {
                    id: contact.id,
                    name: contact.name,
                    email: contact.email,
                    status: contact.status,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error saving contact form submission:", error);
        return NextResponse.json({ error: "Internal Server Error. Please try again later." }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || undefined;
        const search = searchParams.get("search")?.trim() || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const skip = (page - 1) * limit;

        const where: any = {};
        if (['PENDING', 'RESOLVED'].includes(status || '')) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { subject: { contains: search, mode: "insensitive" } },
                { message: { contains: search, mode: "insensitive" } },
            ];
        }

        // test: insert few contacts
        // for (let i = 0; i < 50; i++) {
        //     await prisma.contact.create({
        //         data: {
        //             name: `Test User ${i + 1}`,
        //             email: `testuser${i + 1}@example.com`,
        //             subject: `Test Subject ${i + 1}`,
        //             message: `Test Message ${i + 1}`,
        //         },
        //     });
        // }

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                include: {
                    repliedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true,
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.contact.count({ where }),
        ]);

        return NextResponse.json({
            data: contacts,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Failed to fetch contacts." }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const body = await request.json();
        const { id, reply } = body;

        if (!id || !reply) {
            return NextResponse.json({ error: "Missing 'id' or 'reply'." }, { status: 400 });
        }

        if (reply && reply.length > 2000) {
            return NextResponse.json({ error: "Reply is too long (max 2000 characters)." }, { status: 400 });
        }

        const contact = await prisma.contact.update({
            where: { id },
            data: { status: "RESOLVED", reply, repliedById: user.id, updatedAt: new Date() },
        });

        // send an email to user notifying status update - TODO
        return NextResponse.json({
            message: "Contact status updated successfully.",
            data: contact,
        });
    } catch (error) {
        console.error("Error updating contact:", error);
        return NextResponse.json({ error: "Failed to update contact." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing contact 'id'." }, { status: 400 });
        }

        await prisma.contact.delete({ where: { id } });

        return NextResponse.json({ message: "Contact deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error deleting contact:", error);
        return NextResponse.json({ error: "Failed to delete contact." }, { status: 500 });
    }
}