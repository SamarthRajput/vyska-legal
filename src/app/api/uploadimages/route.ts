import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { syncUser } from "@/actions/syncUser";
import { prisma } from "@/lib/prisma";

// POST - Upload image
export async function POST(request: Request) {
  try {
    const user = await syncUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    // Validation: Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    // Validation: Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size must be less than 5MB." }, { status: 400 });
    }

    // Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadStream = () =>
      new Promise<{ url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vysaka-legal" },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined
          ) => {
            if (error || !result) return reject(error);
            resolve({ url: result.secure_url });
          }
        );
        Readable.from(buffer).pipe(stream);
      });

    const { url: imageUrl } = await uploadStream();

    return NextResponse.json({
      message: "Image uploaded successfully.",
      url: imageUrl
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}


// GET - Get all images uploaded by user (for their image library/gallery)
export async function GET(request: Request) {
  try {
    const user = await syncUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });

    const blogs = await prisma.blog.findMany({
      where: {
        authorId: user.id,
        thumbnailUrl: { not: null }
      },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ blogs }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE - Remove thumbnail from blog
export async function DELETE(request: Request) {
  try {
    const user = await syncUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
    }

    const { blogId, publicId } = await request.json();

    if (!blogId) {
      return NextResponse.json({ error: "Missing blog id." }, { status: 400 });
    }

    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        authorId: user.id,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found or not owned by user." },
        { status: 404 }
      );
    }

    const thumbnailUrl = blog.thumbnailUrl;

    await prisma.blog.update({
      where: { id: blogId },
      data: { thumbnailUrl: null },
    });

    if (
      publicId &&
      typeof publicId === "string" &&
      thumbnailUrl?.includes("res.cloudinary.com")
    ) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }
    return NextResponse.json({ message: "Thumbnail removed from blog." }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
