import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "admin_session";

function getSessionToken() {
  const secret = process.env.SESSION_SECRET || "default-secret";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === getSessionToken();
}

export async function login(password: string): Promise<boolean> {
  if (password !== process.env.ADMIN_PASSWORD) return false;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24시간
    path: "/",
  });

  return true;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
