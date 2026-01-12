// src/lib/getUser.ts
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from './prisma';

/**
 * Get the current logged-in user from Prisma.
 * If the user does not exist, create a new record using Clerk info.
 * Returns null if no user is logged in.
 */
export async function getUser() {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const name = clerkUser.firstName || 'No Name';
    const email = clerkUser.emailAddresses[0].emailAddress;
    const profilePicture = clerkUser.imageUrl || undefined;

    // Use upsert to prevent race conditions
    const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
            name,
            email,
            profilePicture,
        },
        create: {
            clerkId: clerkUser.id,
            name,
            email,
            profilePicture,
            role: 'USER',
        },
    });

    return user
}
