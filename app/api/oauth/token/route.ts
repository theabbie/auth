import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { tokenSchema } from "@/lib/validations/oauth";
import { verifySecret, hashSecret, generateTokenId } from "@/lib/oauth/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/oauth/jwt";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grant_type, code, refresh_token, client_id, client_secret, redirect_uri } =
      tokenSchema.parse(body);

    const db = getAdminFirestore();

    const appsSnapshot = await db
      .collection(COLLECTIONS.OAUTH_APPS)
      .where("clientId", "==", client_id)
      .limit(1)
      .get();

    if (appsSnapshot.empty) {
      return NextResponse.json({ error: "Invalid client" }, { status: 401 });
    }

    const appData = appsSnapshot.docs[0].data();

    if (!verifySecret(client_secret, appData.clientSecret)) {
      return NextResponse.json(
        { error: "Invalid client credentials" },
        { status: 401 }
      );
    }

    if (grant_type === "authorization_code") {
      if (!code || !redirect_uri) {
        return NextResponse.json(
          { error: "Code and redirect_uri required" },
          { status: 400 }
        );
      }

      const codeSnapshot = await db
        .collection(COLLECTIONS.OAUTH_AUTHORIZATION_CODES)
        .where("code", "==", code)
        .where("clientId", "==", client_id)
        .limit(1)
        .get();

      if (codeSnapshot.empty) {
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      }

      const codeDoc = codeSnapshot.docs[0];
      const codeData = codeDoc.data();

      if (codeData.used) {
        return NextResponse.json(
          { error: "Code already used" },
          { status: 400 }
        );
      }

      if (new Date(codeData.expiresAt) < new Date()) {
        return NextResponse.json({ error: "Code expired" }, { status: 400 });
      }

      if (codeData.redirectUri !== redirect_uri) {
        return NextResponse.json(
          { error: "Redirect URI mismatch" },
          { status: 400 }
        );
      }

      await codeDoc.ref.update({ used: true });

      const accessToken = await signAccessToken(
        codeData.userId,
        client_id,
        codeData.scopes
      );

      const tokenId = generateTokenId();
      const refreshTokenValue = await signRefreshToken(
        codeData.userId,
        client_id,
        tokenId
      );
      const refreshTokenHash = hashSecret(refreshTokenValue);

      await db.collection(COLLECTIONS.OAUTH_REFRESH_TOKENS).add({
        tokenId,
        userId: codeData.userId,
        clientId: client_id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        revoked: false,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        access_token: accessToken,
        refresh_token: refreshTokenValue,
        token_type: "Bearer",
        expires_in: 3600,
      });
    } else if (grant_type === "refresh_token") {
      if (!refresh_token) {
        return NextResponse.json(
          { error: "Refresh token required" },
          { status: 400 }
        );
      }

      const payload = await verifyRefreshToken(refresh_token);
      if (!payload) {
        return NextResponse.json(
          { error: "Invalid refresh token" },
          { status: 401 }
        );
      }

      if (payload.client_id !== client_id) {
        return NextResponse.json(
          { error: "Client ID mismatch" },
          { status: 401 }
        );
      }

      const refreshTokenHash = hashSecret(refresh_token);

      const tokenSnapshot = await db
        .collection(COLLECTIONS.OAUTH_REFRESH_TOKENS)
        .where("tokenId", "==", payload.token_id)
        .where("tokenHash", "==", refreshTokenHash)
        .limit(1)
        .get();

      if (tokenSnapshot.empty) {
        return NextResponse.json(
          { error: "Refresh token not found" },
          { status: 401 }
        );
      }

      const tokenData = tokenSnapshot.docs[0].data();

      if (tokenData.revoked) {
        return NextResponse.json(
          { error: "Refresh token revoked" },
          { status: 401 }
        );
      }

      if (new Date(tokenData.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Refresh token expired" },
          { status: 401 }
        );
      }

      const grantSnapshot = await db
        .collection(COLLECTIONS.OAUTH_GRANTS)
        .where("userId", "==", payload.sub)
        .where("clientId", "==", client_id)
        .limit(1)
        .get();

      if (grantSnapshot.empty) {
        return NextResponse.json({ error: "Grant not found" }, { status: 401 });
      }

      const grantData = grantSnapshot.docs[0].data();

      const accessToken = await signAccessToken(
        payload.sub,
        client_id,
        grantData.scopes
      );

      return NextResponse.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
      });
    }

    return NextResponse.json({ error: "Invalid grant type" }, { status: 400 });
  } catch (error: any) {
    console.error("Token error:", error);
    return NextResponse.json(
      { error: error.message || "Token request failed" },
      { status: 400 }
    );
  }
}
