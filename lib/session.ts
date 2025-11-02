import { cookies } from "next/headers";
import { getAdminFirestore } from "./firebase/admin";
import { Session } from "./types/user";
import { COLLECTIONS } from "./firestore-collections";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 14 * 24 * 60 * 60 * 1000;

export async function createSession(uid: string): Promise<string> {
  const db = getAdminFirestore();
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION);

  const session: Session = {
    sessionId,
    uid,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastActivity: now.toISOString(),
  };

  await db.collection(COLLECTIONS.SESSIONS).doc(sessionId).set(session);

  (await cookies()).set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return sessionId;
}

export async function getSession(): Promise<(Session & { userId: string }) | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) return null;

  const db = getAdminFirestore();
  const sessionDoc = await db.collection(COLLECTIONS.SESSIONS).doc(sessionId).get();

  if (!sessionDoc.exists) return null;

  const session = sessionDoc.data() as Session;
  const now = new Date();

  if (new Date(session.expiresAt) < now) {
    await db.collection(COLLECTIONS.SESSIONS).doc(sessionId).delete();
    return null;
  }

  await db.collection(COLLECTIONS.SESSIONS).doc(sessionId).update({
    lastActivity: now.toISOString(),
  });

  return { ...session, userId: session.uid };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    const db = getAdminFirestore();
    await db.collection(COLLECTIONS.SESSIONS).doc(sessionId).delete();
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const db = getAdminFirestore();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(session.uid).get();

  if (!userDoc.exists) return null;

  return { uid: session.uid, ...userDoc.data() };
}
