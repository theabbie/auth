import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getSession } from "@/lib/session";
import { createAppSchema } from "@/lib/validations/oauth";
import { generateClientId, generateClientSecret, hashSecret } from "@/lib/oauth/crypto";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    const appsSnapshot = await db
      .collection(COLLECTIONS.OAUTH_APPS)
      .where("userId", "==", session.userId)
      .get();

    const apps = appsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          appId: doc.id,
          userId: data.userId,
          name: data.name,
          description: data.description,
          clientId: data.clientId,
          redirectUris: data.redirectUris,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ apps });
  } catch (error: any) {
    console.error("Get apps error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch apps" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, redirectUris } = createAppSchema.parse(body);

    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const clientSecretHash = hashSecret(clientSecret);

    const db = getAdminFirestore();
    const appRef = db.collection(COLLECTIONS.OAUTH_APPS).doc();

    const appData = {
      userId: session.userId,
      name,
      description: description || "",
      clientId,
      clientSecret: clientSecretHash,
      redirectUris,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await appRef.set(appData);

    return NextResponse.json({
      success: true,
      app: {
        appId: appRef.id,
        ...appData,
        clientSecret: undefined,
      },
      clientSecret,
    });
  } catch (error: any) {
    console.error("Create app error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create app" },
      { status: 400 }
    );
  }
}
