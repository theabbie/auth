import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getSession } from "@/lib/session";
import { updateAppSchema } from "@/lib/validations/oauth";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appId } = await params;
    const db = getAdminFirestore();
    const appDoc = await db.collection(COLLECTIONS.OAUTH_APPS).doc(appId).get();

    if (!appDoc.exists) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const appData = appDoc.data()!;

    if (appData.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      app: {
        appId: appDoc.id,
        userId: appData.userId,
        name: appData.name,
        description: appData.description,
        clientId: appData.clientId,
        redirectUris: appData.redirectUris,
        createdAt: appData.createdAt,
        updatedAt: appData.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Get app error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch app" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appId } = await params;
    const db = getAdminFirestore();
    const appRef = db.collection(COLLECTIONS.OAUTH_APPS).doc(appId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const appData = appDoc.data()!;

    if (appData.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updates = updateAppSchema.parse(body);

    await appRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updatedDoc = await appRef.get();
    const updatedData = updatedDoc.data()!;

    return NextResponse.json({
      success: true,
      app: {
        appId: updatedDoc.id,
        userId: updatedData.userId,
        name: updatedData.name,
        description: updatedData.description,
        clientId: updatedData.clientId,
        redirectUris: updatedData.redirectUris,
        createdAt: updatedData.createdAt,
        updatedAt: updatedData.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Update app error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update app" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appId } = await params;
    const db = getAdminFirestore();
    const appRef = db.collection(COLLECTIONS.OAUTH_APPS).doc(appId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const appData = appDoc.data()!;

    if (appData.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await appRef.delete();

    await db
      .collection(COLLECTIONS.OAUTH_GRANTS)
      .where("clientId", "==", appData.clientId)
      .get()
      .then((snapshot) => {
        const batch = db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        return batch.commit();
      });

    await db
      .collection(COLLECTIONS.OAUTH_REFRESH_TOKENS)
      .where("clientId", "==", appData.clientId)
      .get()
      .then((snapshot) => {
        const batch = db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        return batch.commit();
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete app error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete app" },
      { status: 500 }
    );
  }
}
