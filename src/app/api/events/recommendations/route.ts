import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { getEvents } from "@/lib/strapi";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allEvents = await getEvents();

    // 1. If user is not logged in, return top upcoming webinars as curated recommendations
    if (!session || !session.user) {
      return NextResponse.json({ 
        recommendations: allEvents.slice(0, 2),
        reason: "Trending webinars curated by our platform team."
      });
    }

    const userId = (session.user as any).id;

    // 2. Fetch user tickets to analyze interest category
    const userTickets = await db.ticket.findMany({
      where: { userId, status: "ACTIVE" }
    });

    if (userTickets.length === 0) {
      return NextResponse.json({ 
        recommendations: allEvents.slice(0, 2),
        reason: "Recommended based on trending topics."
      });
    }

    // 3. Find most common category
    const categories = userTickets.map((t) => t.ticketType === "FREE" ? "Technology" : "Finance"); // Mock categories mapping
    const favoriteCategory = categories.sort(
      (a, b) => categories.filter((v) => v === a).length - categories.filter((v) => v === b).length
    ).pop() || "Technology";

    // 4. Filter events they haven't booked yet matching favorite category
    const bookedEventIds = new Set(userTickets.map((t) => t.eventId));
    let recommended = allEvents.filter(
      (e) => e.category === favoriteCategory && !bookedEventIds.has(e.id)
    );

    // Fallback if no category matches left
    if (recommended.length === 0) {
      recommended = allEvents.filter((e) => !bookedEventIds.has(e.id)).slice(0, 2);
    }

    return NextResponse.json({
      recommendations: recommended,
      reason: `Recommended based on your interest in ${favoriteCategory} masterclasses.`
    });
  } catch (error: any) {
    console.error("AI recommendation error:", error);
    return NextResponse.json({ error: "Internal server error fetching recommendations" }, { status: 500 });
  }
}
