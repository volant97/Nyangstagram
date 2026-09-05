"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  clearSession,
  createSession,
  loginCodes,
  requireCurrentUser,
} from "@/lib/auth/session";
import * as social from "@/lib/services/social-service";
import type {
  HangoutResponse,
  PostCategory,
  ReactionKind,
} from "@/domain/entities";

const text = (max: number) => z.string().trim().min(1).max(max);
const categories = ["게임", "일상", "웃긴 거", "아무말", "애옹즈"] as const;

export async function loginAction(formData: FormData) {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const userId = loginCodes[code];
  if (!userId) redirect("/?loginError=1");
  await createSession(userId);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function checkInAction() {
  const user = await requireCurrentUser();
  await social.checkIn(user.id);
  revalidatePath("/");
}
export async function checkInToolAction() {
  const user = await requireCurrentUser();
  const result = await social.checkIn(user.id);
  revalidatePath("/");
  return result;
}

export async function updateStatusAction(formData: FormData) {
  const user = await requireCurrentUser();
  const input = z
    .object({
      emoji: text(8),
      label: text(30),
      game: z.string().trim().max(40).optional(),
      message: z.string().trim().max(120).optional(),
    })
    .parse({
      emoji: formData.get("emoji"),
      label: formData.get("label"),
      game: formData.get("game") || undefined,
      message: formData.get("message") || undefined,
    });
  await social.updateStatus(user.id, input);
  revalidatePath("/");
}

export async function createPostAction(formData: FormData) {
  const user = await requireCurrentUser();
  const input = z
    .object({ content: text(1000), category: z.enum(categories) })
    .parse({
      content: formData.get("content"),
      category: formData.get("category"),
    });
  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  await social.createPost(user.id, { ...input, images });
  revalidatePath("/");
}

export async function updatePostAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = z
    .object({
      postId: z.string().uuid(),
      content: text(1000),
      category: z.enum(categories),
    })
    .parse(Object.fromEntries(formData));
  await social.updatePost(
    user.id,
    parsed.postId,
    parsed.content,
    parsed.category as PostCategory,
  );
  revalidatePath("/");
}

export async function deletePostAction(formData: FormData) {
  const user = await requireCurrentUser();
  await social.deletePost(
    user.id,
    z.string().uuid().parse(formData.get("postId")),
  );
  revalidatePath("/");
}
export async function addCommentAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = z
    .object({ postId: z.string().uuid(), content: text(240) })
    .parse(Object.fromEntries(formData));
  await social.addComment(user.id, parsed.postId, parsed.content);
  revalidatePath("/");
}
export async function reactAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = z
    .object({
      postId: z.string().uuid(),
      kind: z.enum(["love", "funny", "seen", "play", "sad"]),
    })
    .parse(Object.fromEntries(formData));
  await social.reactToPost(user.id, parsed.postId, parsed.kind as ReactionKind);
  revalidatePath("/");
}
export async function sendGiftAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = z
    .object({
      recipientId: z.string().uuid(),
      itemId: z.string(),
      message: z.string().trim().max(100).optional(),
    })
    .parse({
      ...Object.fromEntries(formData),
      message: formData.get("message") || undefined,
    });
  await social.sendGift(
    user.id,
    parsed.recipientId,
    parsed.itemId,
    parsed.message,
  );
  revalidatePath("/");
}
export async function createHangoutAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = z
    .object({
      title: text(60),
      scheduledAt: z.string().min(1),
      note: z.string().trim().max(120).optional(),
    })
    .parse({
      ...Object.fromEntries(formData),
      note: formData.get("note") || undefined,
    });
  await social.createHangout(user.id, parsed);
  revalidatePath("/");
}
export async function respondHangoutAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = z
    .object({
      hangoutId: z.string().uuid(),
      response: z.enum(["yes", "maybe", "no"]),
    })
    .parse(Object.fromEntries(formData));
  await social.respondToHangout(
    user.id,
    parsed.hangoutId,
    parsed.response as HangoutResponse,
  );
  revalidatePath("/");
}
export async function adjustCurrencyAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = z
    .object({
      targetUserId: z.string().uuid(),
      amount: z.coerce
        .number()
        .int()
        .min(-10000)
        .max(10000)
        .refine((v) => v !== 0),
      reason: text(100),
    })
    .parse(Object.fromEntries(formData));
  await social.adjustCurrency(
    user.id,
    parsed.targetUserId,
    parsed.amount,
    parsed.reason,
  );
  revalidatePath("/");
}
export async function resetDataAction() {
  const user = await requireCurrentUser();
  await social.resetTestData(user.id);
  revalidatePath("/");
}
