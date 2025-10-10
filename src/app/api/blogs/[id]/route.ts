import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // update all blogs to approved for testing
        await prisma.blog.updateMany({
            where: { status: { in: ['PENDING', 'REJECTED'] } },
            data: { status: 'APPROVED' },
        });
        
        const { id } = await params;
        const [blog, relevantBlogs, recentBlogs] = await Promise.all([
            prisma.blog.findUnique({
                where: { id, status: 'APPROVED' },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                },
            }),
            prisma.blog.findMany({
                where: {
                    id: { not: id },
                    status: 'APPROVED'
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 6,
            }),
            prisma.blog.findMany({
                where: {
                    id: { not: id },
                    status: 'APPROVED'
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 6,
            }),
        ]);

        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json({
            blog: blog,
            relevantBlogs: relevantBlogs,
            recentBlogs: recentBlogs,
            success: true,
            message: "Blog fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.error();
    }
}
