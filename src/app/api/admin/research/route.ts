/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getCurrentUser, isAdmin } from '@/actions/syncUser';
import { getUser } from '@/lib/getUser';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

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

    const skip = (page - 1) * limit;
    let where: any = {};
    if (search.length > 0) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter === 'withFile') {
      where.fileUrl = { not: null };
    } else if (filter === 'withoutFile') {
      where.fileUrl = null;
    }
    const orderBy: any = {};
    if (sortBy === 'title') {
      orderBy.title = 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const research = await prisma.research.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(research, { status: 200 });
  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research papers' },
      { status: 500 }
    );
  }
}

// POST: Create/Upload new research paper (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get current user from database
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;
    const thumbnail = formData.get('thumbnail') as File | null;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    let fileUrl = null;
    let thumbnailUrl = null;

    // Upload PDF file to Cloudinary
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            type: 'upload',
            access_mode: 'public',
            folder: 'research-papers',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      fileUrl = (uploadResponse as any).secure_url;
    }

    // Upload thumbnail
    if (thumbnail) {
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'research-thumbnails',
            transformation: [{ width: 400, height: 500, crop: 'fill' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      thumbnailUrl = (uploadResponse as any).secure_url;
    }

    const research = await prisma.research.create({
      data: {
        title,
        description,
        content,
        fileUrl,
        thumbnailUrl,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json(research, { status: 201 });
  } catch (error) {
    console.error('Error creating research:', error);
    return NextResponse.json(
      { error: 'Failed to create research paper' },
      { status: 500 }
    );
  }
}
