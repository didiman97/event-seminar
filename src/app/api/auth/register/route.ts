import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { 
      name, email, password, role, 
      company, position, bio, 
      twitter, linkedin, github, 
      avatarImage 
    } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Check if role is valid
    const targetRole = role && ["ADMIN", "EDITOR", "SPEAKER", "PARTICIPANT"].includes(role)
      ? role
      : "PARTICIPANT";

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Handle avatar image base64 upload
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

    if (avatarImage && typeof avatarImage === "string" && avatarImage.startsWith("data:image/")) {
      try {
        const matches = avatarImage.match(/^data:image\/([A-Za-z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const fileExtension = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExtension}`;
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          avatarUrl = `/uploads/avatars/${fileName}`;
        }
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
      }
    }

    const isApproved = (targetRole === "SPEAKER" || targetRole === "EDITOR") ? false : true;

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: targetRole,
        isApproved,
        avatar: avatarUrl,
        company: company || "",
        position: position || "",
        bio: bio || "",
        twitter: twitter || "",
        linkedin: linkedin || "",
        github: github || "",
      }
    });

    return NextResponse.json(
      { 
        message: "User registered successfully", 
        userId: user.id,
        isApproved
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
