import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    // 2. Fetch users (excluding speakers)
    const users = await db.user.findMany({
      where: {
        role: {
          not: "SPEAKER"
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET admin users API error:", error);
    return NextResponse.json({ error: "Failed to load users list" }, { status: 500 });
  }
}
