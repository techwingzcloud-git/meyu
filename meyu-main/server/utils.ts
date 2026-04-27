import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { serverEnv, isProduction } from "./config";

export type JwtPayload = {
  sub: string;
  role: "user" | "admin";
};

export function normalizeIdentifier(identifier: string) {
  const cleaned = identifier.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return { type: "email" as const, value: cleaned.toLowerCase() };
  }
  const digits = cleaned.replace(/[\s()-]/g, "");
  if (/^\+?[1-9]\d{7,14}$/.test(digits)) {
    return { type: "phone" as const, value: digits.startsWith("+") ? digits : `+${digits}` };
  }
  throw new Error("Enter a valid email address or phone number.");
}

export function generateOtpCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code: string, salt: string) {
  return crypto.createHmac("sha256", `${serverEnv.OTP_PEPPER}:${salt}`).update(code).digest("hex");
}

export function createOtpHash(code: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  return { salt, codeHash: hashOtp(code, salt) };
}

export function signSessionToken(payload: JwtPayload) {
  return jwt.sign(payload, serverEnv.JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, serverEnv.JWT_SECRET) as JwtPayload;
}

export function createSessionCookie(token: string) {
  return serialize("meyu_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  return serialize("meyu_auth", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 0,
  });
}

export function readAuthToken(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies.meyu_auth ?? null;
}

export function buildSecurityHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return headers;
}
