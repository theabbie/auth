import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getSession } from "@/lib/session";
import { authorizeSchema } from "@/lib/validations/oauth";
import { generateAuthorizationCode } from "@/lib/oauth/crypto";
import { validateScopes } from "@/lib/oauth/scopes";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { client_id, redirect_uri, scope, state } = authorizeSchema.parse(body);

    const db = getAdminFirestore();

    const appsSnapshot = await db
      .collection(COLLECTIONS.OAUTH_APPS)
      .where("clientId", "==", client_id)
      .limit(1)
      .get();

    if (appsSnapshot.empty) {
      return NextResponse.json({ error: "Invalid client" }, { status: 400 });
    }

    const appData = appsSnapshot.docs[0].data();

    if (!appData.redirectUris.includes(redirect_uri)) {
      return NextResponse.json(
        { error: "Invalid redirect URI" },
        { status: 400 }
      );
    }

    const requestedScopes = scope ? scope.split(" ") : ["profile:email"];
    const validScopes = validateScopes(requestedScopes);

    if (!validScopes.includes("profile:email")) {
      validScopes.unshift("profile:email");
    }

    const { approvedScopes } = body;

    if (!approvedScopes || !Array.isArray(approvedScopes)) {
      return NextResponse.json(
        { error: "Approved scopes required" },
        { status: 400 }
      );
    }

    const finalScopes = validateScopes(approvedScopes);

    if (!finalScopes.includes("profile:email")) {
      finalScopes.unshift("profile:email");
    }

    const grantSnapshot = await db
      .collection(COLLECTIONS.OAUTH_GRANTS)
      .where("userId", "==", session.userId)
      .where("clientId", "==", client_id)
      .limit(1)
      .get();

    if (!grantSnapshot.empty) {
      const grantRef = grantSnapshot.docs[0].ref;
      await grantRef.update({
        scopes: finalScopes,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.collection(COLLECTIONS.OAUTH_GRANTS).add({
        userId: session.userId,
        clientId: client_id,
        scopes: finalScopes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const code = generateAuthorizationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.collection(COLLECTIONS.OAUTH_AUTHORIZATION_CODES).add({
      code,
      userId: session.userId,
      clientId: client_id,
      redirectUri: redirect_uri,
      scopes: finalScopes,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", code);
    if (state) {
      redirectUrl.searchParams.set("state", state);
    }

    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl.toString(),
    });
  } catch (error: any) {
    console.error("Authorization error:", error);
    return NextResponse.json(
      { error: error.message || "Authorization failed" },
      { status: 400 }
    );
  }
}
