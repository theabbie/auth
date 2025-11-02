import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/session";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { userProfileSchema } from "@/lib/validations/user";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({ profile: user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = userProfileSchema.partial().parse(body);

    const db = getAdminFirestore();
    const userRef = db.collection(COLLECTIONS.USERS).doc(user.uid);

    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const currentDoc = await userRef.get();
    const currentData = currentDoc.data();

    const changedFields: any = {};
    Object.keys(updates).forEach((key) => {
      if (JSON.stringify(updates[key as keyof typeof updates]) !== JSON.stringify(currentData?.[key])) {
        changedFields[key] = updates[key as keyof typeof updates];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
        profile: currentData,
      });
    }

    await userRef.update({ ...changedFields, updatedAt: updateData.updatedAt });

    const updatedDoc = await userRef.get();
    return NextResponse.json({
      success: true,
      profile: updatedDoc.data(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
