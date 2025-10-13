import { NextRequest, NextResponse } from 'next/server';
import { syncUser } from '@/actions/syncUser';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const clerkUser = await syncUser();

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const blog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        if (blog.authorId !== user.id) {
            return NextResponse.json(
                { error: 'Access Denied. You can only delete your own blogs.' },
                { status: 403 }
            );
        }

        await prisma.blog.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: 'Blog deleted successfully' },
            { status: 200 }
        );
    } 
    catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const clerkUser = await syncUser();

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const blog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        if (blog.authorId !== user.id) {
            return NextResponse.json(
                { error: 'Access Denied. You can only update your own blogs.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status } = body;

        if (status && !['DRAFT', 'PENDING'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Users can only set DRAFT or PENDING.' },
                { status: 400 }
            );
        }

        const updatedBlog = await prisma.blog.update({
            where: { id },
        data: {
            status: status || blog.status,
        },
        include: {
            author: {
            select: {
                id: true,
                clerkId: true,
                name: true,
                email: true,
                role: true,
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            },
            },
        },
        });

        return NextResponse.json(updatedBlog);
    } 
    catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
