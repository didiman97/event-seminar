import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 2. Validate payload
    const body = await req.json();
    const { image, name } = body;

    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Format gambar tidak valid." }, { status: 400 });
    }

    // Extract base64 content
    const matches = image.match(/^data:image\/([A-Za-z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Gagal memproses unggahan gambar." }, { status: 400 });
    }

    const fileExtension = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // 3. Create upload directory if not exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean original filename to prevent directory traversal
    const originalName = name ? name.replace(/[^a-zA-Z0-9.-]/g, "_") : `image-${Date.now()}`;
    const cleanFileName = originalName.includes(".") ? originalName : `${originalName}.${fileExtension}`;
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Save image to disk
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({ success: true, url: publicUrl, name: uniqueFileName });
  } catch (error) {
    console.error("Image upload API error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
