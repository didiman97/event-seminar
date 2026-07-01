import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("ticket") || searchParams.get("certificate");

    if (!code) {
      return NextResponse.json({ error: "Kode verifikasi tidak boleh kosong" }, { status: 400 });
    }

    // 1. Search in Certificate database table
    const cert = await db.certificate.findUnique({
      where: { certificateNumber: code },
      include: { user: true }
    });

    if (cert) {
      return NextResponse.json({
        status: "VERIFIED",
        type: "CERTIFICATE",
        certificateNumber: cert.certificateNumber,
        name: cert.participantName || cert.user.name,
        eventTitle: cert.eventTitle,
        issueDate: cert.eventDate,
        issuer: "SeminarVerse Authority",
        hash: cert.verificationHash
      });
    }

    // 2. Search in Ticket database table
    const ticket = await db.ticket.findUnique({
      where: { ticketNumber: code },
      include: { user: true }
    });

    if (ticket) {
      const eventTime = new Date(ticket.eventDate).getTime();
      const currentTime = new Date().getTime();
      const isCompleted = !isNaN(eventTime) ? eventTime < currentTime : true;

      return NextResponse.json({
        status: "VERIFIED",
        type: "TICKET",
        ticketNumber: ticket.ticketNumber,
        name: ticket.user.name,
        eventTitle: ticket.eventTitle,
        issueDate: ticket.eventDate,
        ticketType: ticket.ticketType,
        ticketStatus: ticket.status,
        isCompleted,
        issuer: "SeminarVerse Authority",
        hash: ticket.ticketNumber.split("-")[1] || ticket.id.slice(0, 8).toUpperCase()
      });
    }

    return NextResponse.json({ error: "Sertifikat atau tiket tidak terdaftar di database kami." }, { status: 404 });
  } catch (error: any) {
    console.error("Verification API error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
