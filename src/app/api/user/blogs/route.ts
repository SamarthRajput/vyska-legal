/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { syncUser } from '@/actions/syncUser'; import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    const where: any = {
      authorId: user.id, 
    };

    if (filter !== 'all') {
      where.status = filter.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'title') {
      orderBy.title = 'asc';
    } else if (sortBy === 'status') {
      orderBy.status = 'asc';
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const total = await prisma.blog.count({ where });

    const blogs = await prisma.blog.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return NextResponse.json({
      data: blogs,
      pagination,
    });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
