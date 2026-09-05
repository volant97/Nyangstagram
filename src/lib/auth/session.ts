import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { dataRepository } from "@/lib/repositories";
import { USER_IDS } from "@/data/seed";
import type { User } from "@/domain/entities";

const COOKIE_NAME = "nyang_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

export const loginCodes: Record<string, string> = {
  [getRequiredEnvironmentVariable("LOGIN_CODE_RANTTE").toUpperCase()]:
    USER_IDS.rantte,
  [getRequiredEnvironmentVariable("LOGIN_CODE_NYANG").toUpperCase()]:
    USER_IDS.nyang,
  [getRequiredEnvironmentVariable("LOGIN_CODE_SHURU").toUpperCase()]:
    USER_IDS.shuru,
  [getRequiredEnvironmentVariable("LOGIN_CODE_KYOKA").toUpperCase()]:
    USER_IDS.kyoka,
};

const authSecret = getRequiredEnvironmentVariable("AUTH_SECRET");

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`필수 환경변수 ${name}이 설정되지 않았습니다.`);
  }

  return value;
}

function sign(payload: string) {
  return createHmac("sha256", authSecret).update(payload).digest("base64url");
}

export async function createSession(userId: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${userId}.${expires}`;
  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_SECONDS,
    path: "/",
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [userId, expires, signature] = token.split(".");
  if (!userId || !expires || !signature || Number(expires) < Date.now() / 1000)
    return null;
  const expected = sign(`${userId}.${expires}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const users = await dataRepository.read("users");
  return users.find((user) => user.id === userId) ?? null;
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");
  return user;
}
