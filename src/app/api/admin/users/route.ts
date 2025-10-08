import { getCurrentUser } from "@/actions/syncUser";
import { UserRole } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check if user is logged in
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
    }

    // Check if user is admin via DB
    const existingUser = await getCurrentUser();
    if (!existingUser || existingUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() || undefined;
    const filterRole = searchParams.get("role");
    const postActivity = searchParams.get("postActivity"); // "none" | "published"
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";

    // Pagination
    const pageNum = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("limit")) || 20;
    const skip = (pageNum - 1) * pageSize;

    // Build where condition
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    if (filterRole && (filterRole === "user" || filterRole === "admin")) {
      whereClause.role = filterRole === "admin" ? UserRole.ADMIN : UserRole.USER;
    }

    // Total users count with where filters
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    // Fetch users with pagination and sorting
    let orderByClause: any = {};

    const sortableUserFields = ["name", "email", "createdAt", "updatedAt"];
    if (sortableUserFields.includes(sortBy)) {
      orderByClause[sortBy] = sortDir;
    } else {
      // Default ordering
      orderByClause = { createdAt: "desc" };
    }

    let usersData = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: orderByClause,
    });

    // Paginate after filtering and sorting stats
    const totalFiltered = usersData.length;
    const paginatedUsers = usersData.slice(0, pageSize);

    const pagination = {
      page: pageNum,
      pageSize,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / pageSize),
      hasNext: pageNum < Math.ceil(totalFiltered / pageSize),
      hasPrev: pageNum > 1,
    };

    return NextResponse.json({
      pagination,
      users: paginatedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
