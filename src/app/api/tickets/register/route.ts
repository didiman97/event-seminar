import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, eventTitle, eventDate, ticketType, voucherCode } = await req.json();

    if (!eventId || !eventTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Generate a unique ticket number
    const ticketNumber = `SV-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 3. Generate a QR code base64 string for verification
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/certificate/verify?ticket=${ticketNumber}`;
    const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
      color: {
        dark: "#07111F",
        light: "#FFFFFF"
      }
    });

    // 4. Create ticket record in database
    const ticket = await db.ticket.create({
      data: {
        ticketNumber,
        ticketType: ticketType || "FREE",
        price: 0,
        status: "ACTIVE", // Since final amount is 0, set status directly to ACTIVE
        eventId,
        eventTitle,
        eventDate: eventDate || new Date().toLocaleDateString(),
        qrCodeUrl,
        voucherCode,
        userId: (session.user as any).id
      }
    });

    // 5. Send automated notifications in dashboard
    await db.notification.create({
      data: {
        title: "Registration Confirmed!",
        message: `Your pass for ${eventTitle} is secured. Find your ticket pass in the dashboard.`,
        type: "SUCCESS",
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({ message: "Ticket secured successfully", ticket }, { status: 201 });
  } catch (error: any) {
    console.error("Ticket registration error:", error);
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 });
  }
}
