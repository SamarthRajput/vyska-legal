import { getCurrentUser } from "@/actions/syncUser";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// GET user details by id
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const userId = params.id;

    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized, please log in." },
        { status: 401 }
      );
    }

    const existingUser = await getCurrentUser();
    if (!existingUser || existingUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Access Denied. Admins only." },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userInfo) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch authored posts count
    const authoredPostsCount = await prisma.blog.count({
      where: { authorId: userId },
    });

    return NextResponse.json(
      {
        user: userInfo,
        authoredPostsCount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT update user role
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const userId = params.id;

    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized, please log in." },
        { status: 401 }
      );
    }
    
    const existingUser = await getCurrentUser();
    if (!existingUser || existingUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Access Denied. Admins only." },
        { status: 403 }
      );
    }
    
    if (!userId) {
      console.error("User ID is required.");
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }
    
    const body = await request.json();
    const { role } = body;
    const normalizedRole = role?.toUpperCase();
    
    if (!normalizedRole || (normalizedRole !== "ADMIN" && normalizedRole !== "USER")) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'ADMIN' or 'USER'." },
        { status: 400 }
      );
    }

    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update role in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: normalizedRole === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      },
    });

    return NextResponse.json(
      {
        message: "User role updated successfully.",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const userId = params.id;

    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized, please log in." },
        { status: 401 }
      );
    }
    
    const existingUser = await getCurrentUser();
    if (!existingUser || existingUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Access Denied. Admins only." },
        { status: 403 }
      );
    }
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    // Prevent self-deletion
    if (existingUser.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        blogs: true,
        appointments: true,
        researchPapers: true,
        createdTeamMembers: true,
        repliedContacts: true,
      }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      {
        message: "User deleted successfully.",
        deletedUserId: userId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ 
      error: "Failed to delete user. They may have related data that needs to be handled first." 
    }, { status: 500 });
  }
}
