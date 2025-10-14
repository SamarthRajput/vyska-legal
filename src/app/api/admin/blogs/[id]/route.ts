import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = (await params);
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Access Denied. Admins only." },
                { status: 403 }
            );
        }
        const blog = await prisma.blog.delete({
            where: { id },
        });
        if (!blog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Blog deleted successfully", blog },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting blog:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = (await params);
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Access Denied. Admins only." },
                { status: 403 }
            );
        }
        const { status, rejectionReason } = await request.json();
        if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
                { status: 400 }
            );
        }
        // If status is REJECTED, rejectionReason must be provided
        if (status === "REJECTED" && (!rejectionReason || rejectionReason.trim() === "")) {
            return NextResponse.json(
                { error: "Rejection reason must be provided when rejecting a blog" },
                { status: 400 }
            );
        }
        const blog = await prisma.blog.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === "REJECTED" ? rejectionReason : null,
            },
        });
        if (!blog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Blog updated successfully", blog },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating blog:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}