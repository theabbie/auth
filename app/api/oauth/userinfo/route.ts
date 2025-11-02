import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { verifyAccessToken } from "@/lib/oauth/jwt";
import { getScopeFields, OAUTH_SCOPES } from "@/lib/oauth/scopes";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(payload.sub).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const allowedFields = getScopeFields(payload.scope as any);

    const userInfo: any = {
      sub: payload.sub,
    };

    payload.scope.forEach((scope) => {
      const scopeConfig = OAUTH_SCOPES[scope as keyof typeof OAUTH_SCOPES];
      if (scopeConfig) {
        const field = scopeConfig.field;
        if (userData[field] !== undefined) {
          userInfo[field] = userData[field];
        }
      }
    });

    return NextResponse.json(userInfo);
  } catch (error: any) {
    console.error("Userinfo error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user info" },
      { status: 500 }
    );
  }
}
