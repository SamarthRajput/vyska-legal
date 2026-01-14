import { UserRole } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Fetch admin emails from env, split by comma, and trim
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  // Check if user exists in DB
  const existing = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const isAdmin = adminEmails.includes(email);
  const correctRole = isAdmin ? UserRole.ADMIN : UserRole.USER;

  if (!existing) {
    // If not, create new
    return await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
        email,
        profilePicture: clerkUser.imageUrl ?? null,
        role: correctRole,
      },
    });
  } else {
    const dataToUpdate: any = {
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
      email,
      profilePicture: clerkUser.imageUrl ?? null,
    };

    if (isAdmin && existing.role !== UserRole.ADMIN) {
      dataToUpdate.role = UserRole.ADMIN;
    }

    return await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: dataToUpdate,
    });
  }
}

export async function getCurrentUser() {
  const user = await syncUser();
  return user;
}

export async function isAdmin() {
  const current = await getCurrentUser();
  if (!current) return false;
  return current.role === "ADMIN";
}
