import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const faqsPath = path.join(process.cwd(), "src", "data", "faqs.json");

export async function GET() {
  try {
    if (!fs.existsSync(faqsPath)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(faqsPath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("GET faqs API error:", error);
    return NextResponse.json({ error: "Failed to read FAQs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    // 2. Validate payload
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Payload harus berupa array FAQ." }, { status: 400 });
    }

    for (const item of body) {
      if (typeof item.q !== "string" || !item.q.trim() || typeof item.a !== "string" || !item.a.trim()) {
        return NextResponse.json({ error: "Pertanyaan dan Jawaban FAQ tidak boleh kosong." }, { status: 400 });
      }
    }

    // 3. Clean and save data
    const faqs = body.map((item) => ({
      q: item.q.trim(),
      a: item.a.trim()
    }));

    fs.writeFileSync(faqsPath, JSON.stringify(faqs, null, 2), "utf-8");

    return NextResponse.json({ success: true, faqs });
  } catch (error) {
    console.error("POST faqs API error:", error);
    return NextResponse.json({ error: "Failed to save FAQs" }, { status: 500 });
  }
}
