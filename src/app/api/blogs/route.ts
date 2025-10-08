import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const loggedInUser = await getUser();
        if (!loggedInUser) {
            return NextResponse.json({ error: "User not found, please log in." }, { status: 404 });
        }
        const body = await request.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
        }
        // validate title and content length
        if (title.length < 5 || content.length < 20) {
            return NextResponse.json({ error: "Title must be at least 5 characters and content at least 20 characters long." }, { status: 400 });
        }

        const newBlog = await prisma.blog.create({
            data: {
                title,
                content,
                authorId: loggedInUser.id,
            },
        });

        return NextResponse.json(newBlog, { status: 201 });
    } catch (error) {
        console.error("Error creating blog:", error);
        return NextResponse.json({ error: "Failed to create blog." }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Search by title/content
        const search = searchParams.get("search") || "";

        // // mark all as approved // test
        // const updateAll = await prisma.blog.updateMany({
        //     where: { status: 'PENDING' },
        //     data: { status: 'APPROVED' },
        // });
        // console.log(`Updated ${updateAll.count} blogs to APPROVED status`);
        
        // Fetch blogs
        const blogs = await prisma.blog.findMany({
            where: {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                ],
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
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        });

        // Count total for pagination info
        const totalCount = await prisma.blog.count({
            where: {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                ],
                status: 'APPROVED'
            },
        });

        return NextResponse.json({
            blogs: blogs,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNext: page * limit < totalCount,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json({ error: "Failed to fetch blogs." }, { status: 500 });
    }
}
