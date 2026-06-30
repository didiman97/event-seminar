import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Midtrans Payment Webhook received payload:", body);

    const { order_id, transaction_status, payment_type, fraud_status } = body;

    if (!order_id || !transaction_status) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // 1. Locate Transaction record in DB
    const transaction = await db.transaction.findUnique({
      where: { orderId: order_id }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 2. Map Midtrans status flags to PostgreSQL enum states
    let nextPaymentStatus = "PENDING";
    let nextTicketStatus = "PENDING";
    let notificationMessage = "";

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "challenge") {
        nextPaymentStatus = "PENDING";
      } else {
        nextPaymentStatus = "SETTLEMENT";
        nextTicketStatus = "ACTIVE";
        notificationMessage = "Payment successful! Your entry pass is activated.";
      }
    } else if (transaction_status === "pending") {
      nextPaymentStatus = "PENDING";
      nextTicketStatus = "PENDING";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "expire" ||
      transaction_status === "cancel"
    ) {
      nextPaymentStatus = "FAILED";
      nextTicketStatus = "CANCELLED";
      notificationMessage = "Your ticket registration failed or expired. Please checkout again.";
    }

    // 3. Update Transaction state
    await db.transaction.update({
      where: { orderId: order_id },
      data: {
        paymentStatus: nextPaymentStatus,
        paymentType: payment_type || "MIDTRANS"
      }
    });

    // 4. Update Ticket status if associated with the transaction
    const tickets = await db.ticket.findMany({
      where: { transactionId: transaction.id }
    });

    for (const ticket of tickets) {
      await db.ticket.update({
        where: { id: ticket.id },
        data: { status: nextTicketStatus }
      });
    }

    // 5. Create user notification alert if status changed significantly
    if (notificationMessage) {
      await db.notification.create({
        data: {
          title: nextPaymentStatus === "SETTLEMENT" ? "Payment Settled!" : "Payment Issue",
          message: notificationMessage,
          type: nextPaymentStatus === "SETTLEMENT" ? "SUCCESS" : "DANGER",
          userId: transaction.userId
        }
      });

      // Gamification: Add points for completing ticket purchase
      if (nextPaymentStatus === "SETTLEMENT") {
        await db.user.update({
          where: { id: transaction.userId },
          data: {
            points: { increment: 50 } // Earn 50 points
          }
        });
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Midtrans Webhook parsing error:", error);
    return NextResponse.json({ error: "Internal server error parsing webhook" }, { status: 500 });
  }
}
