import { isAdmin } from '@/actions/syncUser';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// Get a single research paper using id 
export async function GET(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params; 

    const research = await prisma.research.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!research) {
      return NextResponse.json(
        { error: 'Research paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(research, { status: 200 });
  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research paper' },
      { status: 500 }
    );
  }
}

// Update the research paper
export async function PUT(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;

    const research = await prisma.research.update({
      where: { id },
      data: {
        title,
        description,
        content,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json(research, { status: 200 });
  } catch (error) {
    console.error('Error updating research:', error);
    return NextResponse.json(
      { error: 'Failed to update research paper' },
      { status: 500 }
    );
  }
}

// Delete the research paper
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await prisma.research.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Research paper deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting research:', error);
    return NextResponse.json(
      { error: 'Failed to delete research paper' },
      { status: 500 }
    );
  }
}
