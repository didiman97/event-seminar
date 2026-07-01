import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const blogsPath = path.join(process.cwd(), "src", "data", "blogs.json");

export async function GET() {
  try {
    if (!fs.existsSync(blogsPath)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(blogsPath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("GET blogs API error:", error);
    return NextResponse.json({ error: "Failed to read blogs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authorize session (ADMIN or EDITOR)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // 2. Validate payload
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Payload harus berupa array blog." }, { status: 400 });
    }

    // 3. Save data
    fs.writeFileSync(blogsPath, JSON.stringify(body, null, 2), "utf-8");

    return NextResponse.json({ success: true, blogs: body });
  } catch (error) {
    console.error("POST blogs API error:", error);
    return NextResponse.json({ error: "Failed to save blogs" }, { status: 500 });
  }
}
