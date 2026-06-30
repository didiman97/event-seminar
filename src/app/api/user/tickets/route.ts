import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // 1. Authenticate User Session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 2. Fetch Tickets from Database
    const tickets = await db.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("Fetch user tickets error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching tickets" },
      { status: 500 }
    );
  }
}
