import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get user data to clean up avatar blob
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    // Delete avatar blob if it exists and is from Vercel Blob
    if (user?.image && user.image.includes("blob.vercel-storage.com")) {
      try {
        await del(user.image);
      } catch (error) {
        console.error("Error deleting avatar blob:", error);
        // Continue even if blob deletion fails
      }
    }

    // Delete all user-related data in a transaction
    // Prisma will handle cascading deletes for RunRecord, Session, Account
    // due to onDelete: Cascade in the schema
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
