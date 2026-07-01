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

    const { id: userId } = await params;
    const body = await req.json();
    const { role, isApproved } = body;

    const updateData: any = {};

    if (role !== undefined) {
      const validRoles = ["ADMIN", "EDITOR", "SPEAKER", "PARTICIPANT"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
      }

      // Prevent self-demotion to avoid losing admin access
      if (userId === (session.user as any).id && role !== "ADMIN") {
        return NextResponse.json({ error: "Anda tidak dapat menghapus akses ADMIN Anda sendiri." }, { status: 400 });
      }
      updateData.role = role;
    }

    if (isApproved !== undefined) {
      updateData.isApproved = Boolean(isApproved);
    }

    // 2. Perform DB update
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, role: true, isApproved: true }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PUT admin user API error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
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

    const { id: userId } = await params;

    // Prevent self-deletion
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri." }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Prevent deleting other admins
    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Akun administrator yang dilindungi tidak dapat dihapus." }, { status: 400 });
    }

    // 2. Perform DB delete
    await db.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE admin user API error:", error);
    return NextResponse.json({ error: "Failed to delete user account" }, { status: 500 });
  }
}
