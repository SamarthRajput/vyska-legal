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

    // Find user in Prisma
    let user = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
    })

    // Create user in Prisma if not found
    if (!user) {
        user = await prisma.user.create({
            data: {
                clerkId: clerkUser.id,
                name: clerkUser.firstName || 'No Name',
                email: clerkUser.emailAddresses[0].emailAddress,
                profilePicture: clerkUser.imageUrl || undefined,
                role: 'USER',
            },
        })
    }

    return user
}
