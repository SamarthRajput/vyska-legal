import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { BlogStatus, Prisma, UserRole } from "@prisma/client";

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
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search")?.trim() || "";
        const filter = searchParams.get("filter") || "all";
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const authorId = searchParams.get("authorId") || null;

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json(
                { error: "Invalid pagination parameters" },
                { status: 400 }
            );
        }
        // filter can be 'all', 'approved', 'pending', 'rejected'
        const statusFilter =
            filter === "all"
                ? undefined
                : { status: BlogStatus[filter.toUpperCase() as keyof typeof BlogStatus] } satisfies Prisma.BlogWhereInput;

        const orderBy = { [sortBy]: "desc" } satisfies Prisma.BlogOrderByWithRelationInput;

        const skip = (page - 1) * limit;

        // Always include authorId and statusFilter, add search if present
        const where: Prisma.BlogWhereInput = {
            ...(search.length > 0
                ? {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { content: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(authorId ? { authorId } : {}),
            ...statusFilter,
        };

        const total = await prisma.blog.count({ where });
        const posts = await prisma.blog.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: { author: true },
        });
        const allAuthors = await prisma.user.findMany();

        return NextResponse.json({
            data: posts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
            authors: allAuthors,
        });
    } catch (error) {
        console.error(
            "Error fetching blog posts:",
            error instanceof Error ? error.message : error
        );
        return NextResponse.json(
            { error: "Failed to fetch blog posts" },
            { status: 500 }
        );
    }
}
