import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // update all blogs to approved for testing
        await prisma.blog.updateMany({
            where: { status: { in: ['PENDING', 'REJECTED'] } },
            data: { status: 'APPROVED' },
        });

        const { id } = await params;
        const [blog, relevantBlogs, recentBlogs, nextBlog, previousBlog] = await Promise.all([
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
            // Next blog (newer)
            prisma.blog.findFirst({
                where: {
                    createdAt: { gt: (await prisma.blog.findUnique({ where: { id }, select: { createdAt: true } }))?.createdAt },
                    status: 'APPROVED'
                },
                orderBy: { createdAt: 'asc' },
                select: { id: true, title: true }
            }),
            // Previous blog (older)
            prisma.blog.findFirst({
                where: {
                    createdAt: { lt: (await prisma.blog.findUnique({ where: { id }, select: { createdAt: true } }))?.createdAt },
                    status: 'APPROVED'
                },
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true }
            })
        ]);

        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json({
            blog: blog,
            relevantBlogs: relevantBlogs,
            recentBlogs: recentBlogs,
            nextBlog,
            previousBlog,
            success: true,
            message: "Blog fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.error();
    }
}
