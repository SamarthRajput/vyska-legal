

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(teamMembers);
    } catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json(
            { error: "Failed to fetch team members" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Access Denied. Admins only." },
                { status: 403 }
            );
        }

        const { name, role, biography, photoUrl, linkedin, twitter, instagram, facebook } = await request.json();

        if (!name || !role) {
            return NextResponse.json(
                { error: "Name and Role are required." },
                { status: 400 }
            );
        }

        const newMember = await prisma.teamMember.create({
            data: {
                name,
                role,
                biography,
                photoUrl,
                linkedin,
                twitter,
                instagram,
                facebook,
                createdById: user.id,
            },
        });

        return NextResponse.json(newMember, { status: 201 });
    } catch (error) {
        console.error("Error creating team member:", error);
        return NextResponse.json(
            { error: "Failed to create team member" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Access Denied. Admins only." },
                { status: 403 }
            );
        }
        const { id, name, role, biography, photoUrl, linkedin, twitter, instagram, facebook } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
        }

        const updatedMember = await prisma.teamMember.update({
            where: { id },
            data: { name, role, biography, photoUrl, linkedin, twitter, instagram, facebook },
        });

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error("Error updating team member:", error);
        return NextResponse.json(
            { error: "Failed to update team member" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Access Denied. Admins only." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
        }

        await prisma.teamMember.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Team member deleted successfully" });
    } catch (error) {
        console.error("Error deleting team member:", error);
        return NextResponse.json(
            { error: "Failed to delete team member" },
            { status: 500 }
        );
    }
}