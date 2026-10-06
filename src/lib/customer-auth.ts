import {
  randomBytes,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { NextRequest } from "next/server";
import connectToDatabase from "./mongodb";
import AccountSession from "@/models/AccountSession";
export const CUSTOMER_COOKIE = "customer_session";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function checkPassword(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export async function customerId(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  await connectToDatabase();
  const session = await AccountSession.findOne({
    tokenHash: tokenHash(token),
    expiresAt: { $gt: new Date() },
  });
  return session?.accountId?.toString() ?? null;
}
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !!origin && origin === request.nextUrl.origin;
}
