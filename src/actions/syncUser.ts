import { UserRole } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUser() {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const adminEmail = ['rohitkuyada@gmail.com'];

    // Check if user exists in DB
    const existing = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
    });

    if (!existing) {
    // If not, create new
        const newUser = await prisma.user.create({
        data: {
            clerkId: clerkUser.id,
            name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
            profilePicture: clerkUser.imageUrl ?? null,
            role: adminEmail.includes(clerkUser.emailAddresses[0]?.emailAddress ?? "") ? UserRole.ADMIN : UserRole.USER,
        },
    });

    } else {
    // If exists, update info
    await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        profilePicture: clerkUser.imageUrl ?? null,
        // If you want to update role dynamically, uncomment below
        // role: adminEmail.includes(clerkUser.emailAddresses[0]?.emailAddress ?? "") ? UserRole.ADMIN : UserRole.USER,
      },
    });
  }

  return clerkUser;
}

export async function getCurrentUser() {
  await syncUser();
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const existing = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (!existing) {
    return null;
  }
  return existing;
}

export async function isAdmin() {
  const current = await getCurrentUser();
  if (!current) return false;
  return current.role === "ADMIN";
}
