import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request Session & check role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Sesi tidak valid. Silakan login kembali." }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SPEAKER" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Hanya Admin/Panitia yang dapat melakukan absensi." }, { status: 403 });
    }

    const { ticketNumber } = await req.json();

    if (!ticketNumber) {
      return NextResponse.json({ error: "Nomor tiket tidak boleh kosong" }, { status: 400 });
    }

    // 2. Fetch Ticket details with user association
    const ticket = await db.ticket.findUnique({
      where: { ticketNumber },
      include: { user: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak terdaftar di database kami." }, { status: 404 });
    }

    if (ticket.status !== "ACTIVE") {
      return NextResponse.json({ error: `Tiket tidak aktif (Status saat ini: ${ticket.status})` }, { status: 400 });
    }

    if (ticket.checkedIn) {
      return NextResponse.json({
        error: "Peserta sudah melakukan check-in sebelumnya.",
        alreadyCheckedIn: true,
        checkedInAt: ticket.checkedInAt,
        participantName: ticket.user.name,
        eventTitle: ticket.eventTitle,
        ticketNumber: ticket.ticketNumber
      }, { status: 400 });
    }

    // 3. Mark ticket as checked-in
    const updatedTicket = await db.ticket.update({
      where: { ticketNumber },
      data: {
        checkedIn: true,
        checkedInAt: new Date()
      },
      include: { user: true }
    });

    // 4. Record dynamic notification for user
    await db.notification.create({
      data: {
        title: "Check-in Berhasil!",
        message: `Kehadiran Anda di event ${ticket.eventTitle} telah berhasil diverifikasi oleh panitia.`,
        type: "SUCCESS",
        userId: ticket.userId
      }
    });

    return NextResponse.json({
      message: "Check-in berhasil!",
      participantName: updatedTicket.user.name,
      eventTitle: updatedTicket.eventTitle,
      ticketNumber: updatedTicket.ticketNumber,
      checkedInAt: updatedTicket.checkedInAt,
      ticketType: updatedTicket.ticketType
    });
  } catch (error: any) {
    console.error("Check-in API error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
