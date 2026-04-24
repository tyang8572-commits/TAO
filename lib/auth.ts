import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE_NAME, ADMIN_SECRET, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME } from "@/lib/constants";

type SessionPayload = {
  username: string;
  exp: number;
};

const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", ADMIN_SECRET).update(value).digest("base64url");
}

export function verifyAdminCredentials(username: string, password: string) {
  return username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD;
}

export function createAdminSessionToken(username: string) {
  const payload: SessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_AGE_SECONDS
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function decodeAdminSessionToken(token: string | undefined | null) {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (sign(encoded) !== signature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function setAdminSession() {
  const token = createAdminSessionToken(DEFAULT_ADMIN_USERNAME);
  cookies().set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_AGE_SECONDS
  });
}

export function clearAdminSession() {
  cookies().set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function isAdminAuthenticated() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(decodeAdminSessionToken(token));
}

export function requireAdminPage() {
  if (!isAdminAuthenticated()) {
    redirect("/admin/login");
  }
}
