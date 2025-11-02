import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/session";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { verificationId, code } = body;

    const db = getAdminFirestore();
    const verificationDoc = await db.collection(COLLECTIONS.PHONE_VERIFICATIONS).doc(verificationId).get();

    if (!verificationDoc.exists) {
      return NextResponse.json(
        { error: "Invalid verification ID" },
        { status: 400 }
      );
    }

    const verification = verificationDoc.data();
    
    if (verification?.uid !== user.uid) {
      return NextResponse.json(
        { error: "Verification mismatch" },
        { status: 403 }
      );
    }

    if (new Date(verification.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Verification expired" },
        { status: 400 }
      );
    }

    await db.collection(COLLECTIONS.USERS).doc(user.uid).update({
      phone: verification.phone,
      phoneVerified: true,
      updatedAt: new Date().toISOString(),
    });

    await db.collection(COLLECTIONS.PHONE_VERIFICATIONS).doc(verificationId).delete();

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
