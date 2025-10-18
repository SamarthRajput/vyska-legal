// src: /app/api/admin/transctions
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Access Denied. Admins only." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;

        const skip = (page - 1) * limit;

        // Main query
        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: search
                    ? {
                        OR: [
                            { id: { contains: search, mode: "insensitive" } },
                            { eventType: { contains: search, mode: "insensitive" } },
                            {
                                payment: {
                                    OR: [
                                        { orderId: { contains: search, mode: "insensitive" } },
                                        { paymentId: { contains: search, mode: "insensitive" } },
                                        { method: { contains: search, mode: "insensitive" } },
                                        // { status: { contains: search, mode: "insensitive" } },
                                        { user: { name: { contains: search, mode: "insensitive" } } },
                                        { user: { email: { contains: search, mode: "insensitive" } } },
                                    ],
                                },
                            },
                        ],
                    }
                    : {},
                include: {
                    payment: {
                        select: {
                            id: true,
                            orderId: true,
                            paymentId: true,
                            amount: true,
                            currency: true,
                            status: true,
                            method: true,
                            description: true,
                            paymentFor: true,
                            createdAt: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                            service: {
                                select: {
                                    id: true,
                                    title: true,
                                    price: true,
                                },
                            },
                            appointment: {
                                select: {
                                    id: true,
                                    userName: true,
                                    userEmail: true,
                                    agenda: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.transaction.count({
                where: search
                    ? {
                        OR: [
                            { id: { contains: search, mode: "insensitive" } },
                            { eventType: { contains: search, mode: "insensitive" } },
                            {
                                payment: {
                                    OR: [
                                        { orderId: { contains: search, mode: "insensitive" } },
                                        { paymentId: { contains: search, mode: "insensitive" } },
                                        // { status: { contains: search, mode: "insensitive" } },
                                    ],
                                },
                            },
                        ],
                    }
                    : {},
            }),
        ]);

        return NextResponse.json({
            data: transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
