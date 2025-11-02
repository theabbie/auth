import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID required" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const appsSnapshot = await db
      .collection(COLLECTIONS.OAUTH_APPS)
      .where("clientId", "==", clientId)
      .limit(1)
      .get();

    if (appsSnapshot.empty) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const appData = appsSnapshot.docs[0].data();

    return NextResponse.json({
      app: {
        name: appData.name,
        description: appData.description,
      },
    });
  } catch (error: any) {
    console.error("Get app by client ID error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch app" },
      { status: 500 }
    );
  }
}
