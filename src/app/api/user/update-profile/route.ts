/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { syncUser } from '@/actions/syncUser';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  profilePicture: z.string().url('Invalid URL').optional().nullable(),
});

export async function PUT(request: Request) {
  try {
    const clerkUser = await syncUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: {
        clerkId: clerkUser.id,
      },
      data: {
        name: validatedData.name,
        profilePicture: validatedData.profilePicture ?? null,
        updatedAt: new Date(),
      },
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
    });

    return NextResponse.json(updatedUser);
    } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
