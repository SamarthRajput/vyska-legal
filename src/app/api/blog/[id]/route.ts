import { NextRequest, NextResponse } from 'next/server';
import { syncUser } from '@/actions/syncUser';
import { z } from 'zod';

// Schema for validation
const updateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  thumbnailUrl: z.string().url('Invalid URL').optional().nullable(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  rejectionReason: z.string().optional().nullable(),
});

// GET single blog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id },
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

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// UPDATE blog
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const clerkUser = await syncUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Check authorization: user must be author or admin
    const isAdmin = user.role === 'ADMIN';
    const isAuthor = existingBlog.authorId === user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Access Denied. You can only edit your own blogs.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateBlogSchema.parse(body);

    // Prepare update data
    const updateData: any = {
      title: validatedData.title,
      content: validatedData.content,
      thumbnailUrl: validatedData.thumbnailUrl ?? null,
    };

    // Only admins can change status and rejection reason
    if (isAdmin) {
      if (validatedData.status) {
        updateData.status = validatedData.status;
      }
      if (validatedData.rejectionReason !== undefined) {
        updateData.rejectionReason = validatedData.rejectionReason;
      }
    } else {
      // Regular users can only set status to DRAFT or PENDING
      if (validatedData.status && ['DRAFT', 'PENDING'].includes(validatedData.status)) {
        updateData.status = validatedData.status;
      }
    }

    // Update the blog
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: updateData,
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
