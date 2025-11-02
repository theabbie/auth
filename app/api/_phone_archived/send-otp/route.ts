import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/session";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { phoneSchema } from "@/lib/validations/user";

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
    const phone = phoneSchema.parse(body.phone);

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    const verificationId = crypto.randomUUID();

    await db.collection(COLLECTIONS.PHONE_VERIFICATIONS).doc(verificationId).set({
      uid: user.uid,
      phone,
      verificationId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      verificationId,
      message: "OTP sent to phone",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
