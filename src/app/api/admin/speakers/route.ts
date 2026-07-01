import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    // 2. Fetch speakers
    const speakers = await db.user.findMany({
      where: {
        role: "SPEAKER"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(speakers);
  } catch (error) {
    console.error("GET admin speakers API error:", error);
    return NextResponse.json({ error: "Failed to load speakers list" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, bio, company, position, photo, twitter, linkedin, github } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nama dan email wajib diisi." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    // Create speaker with a default hashed password (speaker123)
    const passwordHash = await bcrypt.hash("speaker123", 10);

    const newSpeaker = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "SPEAKER",
        isApproved: true,
        avatar: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
        company: company || "",
        position: position || "",
        bio: bio || "",
        twitter: twitter || "",
        linkedin: linkedin || "",
        github: github || "",
      }
    });

    return NextResponse.json(newSpeaker, { status: 201 });
  } catch (error) {
    console.error("POST admin speakers API error:", error);
    return NextResponse.json({ error: "Failed to create speaker profile" }, { status: 500 });
  }
}
