import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

// Intercept readFileSync to bypass virtualized Next.js/Turbopack folder paths for standard AFM fonts
const originalReadFileSync = fs.readFileSync;
(fs as any).readFileSync = function (filePath: any, options?: any) {
  if (typeof filePath === "string" && filePath.includes("pdfkit") && filePath.endsWith(".afm")) {
    const filename = path.basename(filePath);
    const correctedPath = path.join(process.cwd(), "node_modules", "pdfkit", "js", "data", filename);
    return originalReadFileSync(correctedPath, options);
  }
  return originalReadFileSync.apply(this, arguments as any);
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate Request Session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: ticketId } = await params;

    // 2. Fetch Ticket or Certificate details
    let ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true }
    }) as any;

    let certNumber = "";
    let eventTitle = "";
    let eventDate = "";
    let recipientName = "";

    if (ticket) {
      // Verify ownership
      if (ticket.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
        return new NextResponse("Forbidden access", { status: 403 });
      }
      // Verify attendance check-in status
      if (!ticket.checkedIn && (session.user as any).role !== "ADMIN") {
        return new NextResponse("Anda harus melakukan absensi kehadiran sebelum dapat mengunduh sertifikat.", { status: 400 });
      }
      certNumber = ticket.ticketNumber;
      eventTitle = ticket.eventTitle;
      eventDate = ticket.eventDate;
      recipientName = ticket.user.name;
    } else {
      // Try to find in Certificate table
      const certificate = await db.certificate.findUnique({
        where: { id: ticketId },
        include: { user: true }
      });
      if (!certificate) {
        return new NextResponse("Certificate record not found", { status: 404 });
      }
      // Verify ownership
      if (certificate.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
        return new NextResponse("Forbidden access", { status: 403 });
      }
      certNumber = certificate.certificateNumber;
      eventTitle = certificate.eventTitle;
      eventDate = certificate.eventDate;
      recipientName = certificate.participantName || certificate.user.name;
    }

    // Load dynamic settings from config
    const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");
    let settings = {
      certTitle: "CERTIFICATE OF COMPLETION",
      certIssuer: "SeminarVerse Academy",
      certSignatureName: "Sarah Jenkins",
      certSignatureRole: "Sarah Jenkins, Program Chair"
    };

    try {
      if (fs.existsSync(settingsPath)) {
        const settingsData = originalReadFileSync(settingsPath, "utf-8");
        const parsed = JSON.parse(settingsData);
        settings = {
          certTitle: parsed.certTitle || settings.certTitle,
          certIssuer: parsed.certIssuer || settings.certIssuer,
          certSignatureName: parsed.certSignatureName || settings.certSignatureName,
          certSignatureRole: parsed.certSignatureRole || settings.certSignatureRole
        };
      }
    } catch (err) {
      console.error("Error reading PDF settings:", err);
    }

    // 3. Generate QR code representation buffer for verify url
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/certificate/verify?ticket=${certNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1 });
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");

    // 4. Initialize vector PDF Document with landscape layout
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 40, left: 40, right: 40, bottom: 40 }
    });

    // Collect buffer data chunks
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    // Wait for end signal
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));
    });

    // 5. Draw Certificate Styles
    // Draw Dark Navy Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#07111F");

    // Draw Blue/Cyan Neon borders
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(3)
       .stroke("#2563EB");
       
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
       .lineWidth(1)
       .stroke("#22D3EE");

    // Header Title
    doc.fillColor("#22D3EE")
       .fontSize(14)
       .font("Helvetica-Bold")
       .text(settings.certIssuer.toUpperCase(), 0, 80, { align: "center", characterSpacing: 1 });

    doc.moveDown(0.5);
    
    // Sub-title
    doc.fillColor("#94A3B8")
       .fontSize(10)
       .font("Helvetica")
       .text(settings.certTitle.toUpperCase(), { align: "center" });

    // Ribbon horizontal divider line
    doc.moveDown(1);
    doc.moveTo(150, doc.y)
       .lineTo(doc.page.width - 150, doc.y)
       .lineWidth(0.5)
       .stroke("#22D3EE");

    doc.moveDown(2);

    // Certify message
    doc.fillColor("#94A3B8")
       .fontSize(11)
       .text("This is to certify that", { align: "center" });

    doc.moveDown(1);

    // Participant Name (Big Bold White)
    doc.fillColor("#FFFFFF")
       .fontSize(28)
       .font("Helvetica-Bold")
       .text(recipientName, { align: "center" });

    doc.moveDown(1);

    // Completion statement
    doc.fillColor("#94A3B8")
       .fontSize(11)
       .font("Helvetica")
       .text("has successfully completed all curricular components for", { align: "center" });

    doc.moveDown(0.5);

    // Event title
    doc.fillColor("#22D3EE")
       .fontSize(16)
       .font("Helvetica-Bold")
       .text(eventTitle, { align: "center" });

    // Footer row positions
    const footerY = doc.page.height - 130;

    // Draw programmatic digital signature lines
    doc.moveTo(100, footerY)
       .lineTo(250, footerY)
       .lineWidth(0.5)
       .stroke("#FFFFFF");

    doc.fillColor("#FFFFFF")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text(settings.certSignatureName, 100, footerY + 8)
       .fillColor("#94A3B8")
       .fontSize(7)
       .font("Helvetica")
       .text(settings.certSignatureRole, 100, footerY + 22);

    // Draw validation QR code pass
    doc.image(qrBuffer, doc.page.width - 180, footerY - 40, { width: 80, height: 80 });
    
    doc.fillColor("#94A3B8")
       .fontSize(7)
       .font("Helvetica")
       .text("Scan code to verify", doc.page.width - 180, footerY + 45, { width: 80, align: "center" });

    // Issue Date and Unique Code
    doc.fillColor("#94A3B8")
       .fontSize(8)
       .font("Helvetica-Bold")
       .text(`Issue Date: ${eventDate}`, 300, footerY)
       .fontSize(8)
       .font("Helvetica")
       .text(`Verification ID: ${certNumber}`, 300, footerY + 15);

    // Close and stream PDF document
    doc.end();

    const pdfBuffer = await pdfPromise;

    // 6. Return direct binary payload response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="certificate-${certNumber}.pdf"`
      }
    });
  } catch (error: any) {
    console.error("Certificate PDF compilation error:", error);
    return new NextResponse("Internal server error generating certificate", { status: 500 });
  }
}
