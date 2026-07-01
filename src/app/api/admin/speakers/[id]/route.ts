import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    const { id: speakerId } = await params;
    const body = await req.json();
    const { name, bio, company, position, photo, twitter, linkedin, github, isApproved } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (company !== undefined) updateData.company = company;
    if (position !== undefined) updateData.position = position;
    if (photo !== undefined) updateData.avatar = photo;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (isApproved !== undefined) updateData.isApproved = Boolean(isApproved);

    const updatedUser = await db.user.update({
      where: { id: speakerId },
      data: updateData
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PUT admin speaker API error:", error);
    return NextResponse.json({ error: "Failed to update speaker profile" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    const { id: speakerId } = await params;

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: speakerId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Speaker tidak ditemukan." }, { status: 404 });
    }

    await db.user.delete({
      where: { id: speakerId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE admin speaker API error:", error);
    return NextResponse.json({ error: "Failed to delete speaker account" }, { status: 500 });
  }
}
