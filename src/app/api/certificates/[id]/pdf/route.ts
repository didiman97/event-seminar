import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

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

    const resolvedParams = await params;
    const ticketId = resolvedParams.id;

    // 2. Fetch Ticket details with user association
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true }
    });

    if (!ticket) {
      return new NextResponse("Certificate ticket record not found", { status: 404 });
    }

    // Verify ownership
    if (ticket.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return new NextResponse("Forbidden access", { status: 403 });
    }

    // 3. Generate QR code representation buffer for verify url
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/certificate/verify?ticket=${ticket.ticketNumber}`;
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
       .text("SEMINARVERSE ACADEMY CREDENTIAL", 0, 80, { align: "center", characterSpacing: 1 });

    doc.moveDown(0.5);
    
    // Sub-title
    doc.fillColor("#94A3B8")
       .fontSize(10)
       .font("Helvetica")
       .text("CERTIFICATE OF COMPLETION", { align: "center" });

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
       .text(ticket.user.name, { align: "center" });

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
       .text(ticket.eventTitle, { align: "center" });

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
       .text("Sarah Jenkins", 100, footerY + 8)
       .fillColor("#94A3B8")
       .fontSize(7)
       .font("Helvetica")
       .text("Sarah Jenkins, Program Chair", 100, footerY + 22);

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
       .text(`Issue Date: ${ticket.eventDate}`, 300, footerY)
       .fontSize(8)
       .font("Helvetica")
       .text(`Verification ID: ${ticket.ticketNumber}`, 300, footerY + 15);

    // Close and stream PDF document
    doc.end();

    const pdfBuffer = await pdfPromise;

    // 6. Return direct binary payload response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="certificate-${ticket.ticketNumber}.pdf"`
      }
    });
  } catch (error: any) {
    console.error("Certificate PDF compilation error:", error);
    return new NextResponse("Internal server error generating certificate", { status: 500 });
  }
}
