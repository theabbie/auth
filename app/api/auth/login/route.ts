import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { loginSchema } from "@/lib/validations/user";
import { createSession } from "@/lib/session";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    let idToken = body.idToken;
    
    if (!idToken) {
      return NextResponse.json(
        { error: "Authentication token required" },
        { status: 401 }
      );
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRecord = await auth.getUser(uid);

    if (!userRecord.emailVerified) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 }
      );
    }

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await createSession(uid);

    return NextResponse.json({
      success: true,
      user: { uid, ...userDoc.data() },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 401 }
    );
  }
}
