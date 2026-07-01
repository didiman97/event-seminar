import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");

export async function GET() {
  try {
    if (!fs.existsSync(settingsPath)) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 });
    }
    const data = fs.readFileSync(settingsPath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("GET settings API error:", error);
    return NextResponse.json({ error: "Failed to read configurations" }, { status: 500 });
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
    const requiredKeys = [
      "logoText", "logoAbbreviation", 
      "heroHeadline", "heroDescription", "heroTagline", "heroBtnText", "heroBtnLink",
      "sectionWebinarTitle", "sectionEventsTitle", "sectionEventsSubtitle",
      "sectionSpeakersTitle", "sectionSpeakersSubtitle",
      "sectionTestimonialsTitle", "sectionTestimonialsSubtitle",
      "sectionFaqTitle", "sectionFaqSubtitle",
      "heroCtaTitle", "heroCtaDescription",
      "certTitle", "certSignatureName", "certSignatureRole", "certIssuer"
    ];

    for (const key of requiredKeys) {
      if (typeof body[key] !== "string" || !body[key].trim()) {
        return NextResponse.json({ error: `Parameter '${key}' tidak boleh kosong.` }, { status: 400 });
      }
    }

    // 3. Persist to disk
    const settings = {
      logoText: body.logoText.trim(),
      logoAbbreviation: body.logoAbbreviation.trim(),
      logoImageUrl: typeof body.logoImageUrl === "string" ? body.logoImageUrl.trim() : "",
      heroHeadline: body.heroHeadline.trim(),
      heroDescription: body.heroDescription.trim(),
      heroTagline: body.heroTagline.trim(),
      heroBtnText: body.heroBtnText.trim(),
      heroBtnLink: body.heroBtnLink.trim(),
      sectionWebinarTitle: body.sectionWebinarTitle.trim(),
      sectionEventsTitle: body.sectionEventsTitle.trim(),
      sectionEventsSubtitle: body.sectionEventsSubtitle.trim(),
      sectionSpeakersTitle: body.sectionSpeakersTitle.trim(),
      sectionSpeakersSubtitle: body.sectionSpeakersSubtitle.trim(),
      sectionTestimonialsTitle: body.sectionTestimonialsTitle.trim(),
      sectionTestimonialsSubtitle: body.sectionTestimonialsSubtitle.trim(),
      sectionFaqTitle: body.sectionFaqTitle.trim(),
      sectionFaqSubtitle: body.sectionFaqSubtitle.trim(),
      heroCtaTitle: body.heroCtaTitle.trim(),
      heroCtaDescription: body.heroCtaDescription.trim(),
      certTitle: body.certTitle.trim(),
      certSignatureName: body.certSignatureName.trim(),
      certSignatureRole: body.certSignatureRole.trim(),
      certIssuer: body.certIssuer.trim()
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("POST settings API error:", error);
    return NextResponse.json({ error: "Failed to save configurations" }, { status: 500 });
  }
}
