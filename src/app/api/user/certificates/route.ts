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

    // 2. Fetch Tickets from Database to find completed events
    const tickets = await db.ticket.findMany({
      where: { 
        userId,
        status: "ACTIVE" 
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter tickets where the user has checked in (attended the event)
    const completedTickets = tickets.filter((t) => t.checkedIn === true);

    // 3. Fetch direct certificates from the Certificate table if any
    const dbCertificates = await db.certificate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 4. Merge completed tickets and direct certificates
    const certificatesFromTickets = completedTickets.map((t) => ({
      id: t.id, // Using ticket ID so the existing pdf generator route can fetch it directly
      certificateNumber: t.ticketNumber,
      eventId: t.eventId,
      eventTitle: t.eventTitle,
      eventDate: t.eventDate,
      qrCodeUrl: t.qrCodeUrl,
      isFromTicket: true,
      hash: t.ticketNumber.split("-")[1] || t.id.slice(0, 8).toUpperCase(),
      createdAt: t.createdAt
    }));

    const mappedDbCerts = dbCertificates.map((c) => ({
      id: c.id,
      certificateNumber: c.certificateNumber,
      eventId: c.eventId,
      eventTitle: c.eventTitle,
      eventDate: c.eventDate,
      qrCodeUrl: c.qrCodeUrl,
      isFromTicket: false,
      hash: c.verificationHash,
      createdAt: c.createdAt
    }));

    // Combine lists, removing duplicates based on eventTitle to avoid duplicate certificates
    const combined = [...mappedDbCerts, ...certificatesFromTickets];
    const seen = new Set();
    const uniqueCertificates = combined.filter((c) => {
      const duplicate = seen.has(c.eventTitle);
      seen.add(c.eventTitle);
      return !duplicate;
    });

    return NextResponse.json({ certificates: uniqueCertificates });
  } catch (error: any) {
    console.error("Fetch user certificates error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching certificates" },
      { status: 500 }
    );
  }
}
