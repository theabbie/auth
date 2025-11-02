import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    const userRecord = await auth.getUser(uid);
    
    if (userRecord.email !== email) {
      return NextResponse.json(
        { error: "Email mismatch" },
        { status: 403 }
      );
    }

    if (!userRecord.emailVerified) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 }
      );
    }

    const existingUser = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    
    if (existingUser.exists) {
      return NextResponse.json({
        success: true,
        message: "User already exists",
      });
    }

    await db.collection(COLLECTIONS.USERS).doc(uid).set({
      uid,
      email,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 400 }
    );
  }
}
