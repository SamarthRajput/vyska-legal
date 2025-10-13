import { NextResponse } from 'next/server';
import { syncUser } from '@/actions/syncUser';

export async function GET() {
  try {
    const clerkUser = await syncUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized, please log in.' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
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

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
