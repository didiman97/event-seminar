import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { createMidtransToken } from "@/lib/midtrans";
import { getEvents } from "@/lib/strapi";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, ticketType, price, voucherCode } = await req.json();

    if (!eventId || !ticketType || price === undefined) {
      return NextResponse.json({ error: "Missing required details" }, { status: 400 });
    }

    // 2. Fetch event information
    const events = await getEvents();
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 3. Create unique Midtrans Order ID
    const orderId = `ORDER-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 4. Generate Midtrans token using helper client
    const checkoutDetails = {
      orderId,
      grossAmount: Number(price),
      customerDetails: {
        firstName: session.user.name || "Participant",
        email: session.user.email || ""
      },
      itemDetails: [
        {
          id: eventId,
          price: Number(price),
          quantity: 1,
          name: `${event.title} - ${ticketType}`
        }
      ]
    };

    const midtransRes = await createMidtransToken(checkoutDetails);

    // 5. Create Transaction record in DB (PENDING status)
    const transaction = await db.transaction.create({
      data: {
        orderId,
        amount: Number(price),
        paymentStatus: "PENDING",
        token: midtransRes.token,
        redirectUrl: midtransRes.redirectUrl,
        userId: (session.user as any).id
      }
    });

    // 6. Generate access ticket pass with PENDING status
    const ticketNumber = `SV-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    
    // Set up scannable QR ticket preview
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/certificate/verify?ticket=${ticketNumber}`;
    const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
      color: { dark: "#07111F", light: "#FFFFFF" }
    });

    await db.ticket.create({
      data: {
        ticketNumber,
        ticketType: ticketType || "PAID",
        price: Number(price),
        status: "PENDING", // Status is pending until transaction webhook settled
        eventId,
        eventTitle: event.title,
        eventDate: new Date(event.startDate).toLocaleDateString(),
        qrCodeUrl,
        voucherCode,
        userId: (session.user as any).id,
        transactionId: transaction.id
      }
    });

    return NextResponse.json({ 
      token: midtransRes.token, 
      redirectUrl: midtransRes.redirectUrl, 
      orderId 
    });
  } catch (error: any) {
    console.error("Payment checkout initialization error:", error);
    return NextResponse.json({ error: "Internal server error starting checkout" }, { status: 500 });
  }
}
