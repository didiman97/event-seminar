import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    // 2. Validate payload
    const body = await req.json();
    const { logoImage } = body;

    if (!logoImage || typeof logoImage !== "string" || !logoImage.startsWith("data:image/")) {
      return NextResponse.json({ error: "Format gambar logo tidak valid." }, { status: 400 });
    }

    // Extract base64 content
    const matches = logoImage.match(/^data:image\/([A-Za-z0-9]+);base64,(.+)$/);
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

    // Write file to public/uploads/logo.[ext]
    const fileName = `logo-${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    // 4. Update settings.json logoImageUrl
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf-8");
      const settings = JSON.parse(data);
      settings.logoImageUrl = publicUrl;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
    }

    return NextResponse.json({ success: true, logoImageUrl: publicUrl });
  } catch (error) {
    console.error("Logo upload API error:", error);
    return NextResponse.json({ error: "Failed to upload logo image" }, { status: 500 });
  }
}
