import "server-only";

import type { HangoutResponse } from "@/domain/entities";
import { dataRepository } from "@/lib/repositories";
import { imageStorage } from "@/lib/storage/image-storage";
import {
  createEntityId,
  getCurrentTimestamp,
  requireSpaceMembership,
} from "./service-context";

export async function sendGift(
  userId: string,
  recipientId: string,
  itemId: string,
  message?: string,
) {
  const membership = await requireSpaceMembership(userId);
  if (recipientId === userId) {
    throw new Error("선물은 다른 멤버에게 보내주세요.");
  }

  await dataRepository.transaction(async () => {
    const [members, items, transactions, gifts, activities] = await Promise.all(
      [
        dataRepository.read("space-members"),
        dataRepository.read("shop-items"),
        dataRepository.read("currency-transactions"),
        dataRepository.read("gifts"),
        dataRepository.read("activities"),
      ],
    );
    const recipientIsMember = members.some(
      (member) =>
        member.spaceId === membership.spaceId && member.userId === recipientId,
    );
    if (!recipientIsMember) {
      throw new Error("받는 멤버를 찾을 수 없어요.");
    }

    const giftItem = items.find(
      (item) =>
        item.id === itemId &&
        item.active &&
        item.spaceId === membership.spaceId,
    );
    if (!giftItem) {
      throw new Error("선물을 찾을 수 없어요.");
    }

    const balance = transactions
      .filter(
        (transaction) =>
          transaction.userId === userId &&
          transaction.spaceId === membership.spaceId,
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
    if (balance < giftItem.price) {
      throw new Error("보유 냥이 부족해요.");
    }

    const createdAt = getCurrentTimestamp();
    const giftId = createEntityId();
    transactions.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      userId,
      amount: -giftItem.price,
      type: "GIFT_PURCHASE",
      reason: `${giftItem.name} 선물`,
      createdAt,
    });
    gifts.push({
      id: giftId,
      spaceId: membership.spaceId,
      senderId: userId,
      recipientId,
      itemId,
      message,
      createdAt,
    });
    activities.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      actorId: userId,
      type: "GIFT_SENT",
      targetType: "gift",
      targetId: giftId,
      createdAt,
    });
    await Promise.all([
      dataRepository.write("currency-transactions", transactions),
      dataRepository.write("gifts", gifts),
      dataRepository.write("activities", activities),
    ]);
  });
}

type CreateHangoutInput = {
  title: string;
  scheduledAt: string;
  note?: string;
};

export async function createHangout(userId: string, input: CreateHangoutInput) {
  const membership = await requireSpaceMembership(userId);
  await dataRepository.transaction(async () => {
    const hangouts = await dataRepository.read("hangouts");
    hangouts.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      creatorId: userId,
      ...input,
      scheduledAt: new Date(input.scheduledAt).toISOString(),
      responses: [{ userId, response: "yes" }],
      createdAt: getCurrentTimestamp(),
    });
    await dataRepository.write("hangouts", hangouts);
  });
}

export async function respondToHangout(
  userId: string,
  hangoutId: string,
  response: HangoutResponse,
) {
  const membership = await requireSpaceMembership(userId);
  await dataRepository.transaction(async () => {
    const [hangouts, activities] = await Promise.all([
      dataRepository.read("hangouts"),
      dataRepository.read("activities"),
    ]);
    const hangout = hangouts.find(
      (item) => item.id === hangoutId && item.spaceId === membership.spaceId,
    );
    if (!hangout) {
      throw new Error("모임을 찾을 수 없어요.");
    }

    const currentResponse = hangout.responses.find(
      (item) => item.userId === userId,
    );
    if (currentResponse) {
      currentResponse.response = response;
    } else {
      hangout.responses.push({ userId, response });
    }
    activities.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      actorId: userId,
      type: "HANGOUT_JOINED",
      targetType: "hangout",
      targetId: hangoutId,
      createdAt: getCurrentTimestamp(),
    });
    await Promise.all([
      dataRepository.write("hangouts", hangouts),
      dataRepository.write("activities", activities),
    ]);
  });
}

export async function adjustCurrency(
  actorId: string,
  targetUserId: string,
  amount: number,
  reason: string,
) {
  const membership = await requireSpaceMembership(actorId);
  if (membership.role === "member") {
    throw new Error("관리자 권한이 필요해요.");
  }

  await dataRepository.transaction(async () => {
    const transactions = await dataRepository.read("currency-transactions");
    transactions.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      userId: targetUserId,
      amount,
      type: "ADMIN_ADJUSTMENT",
      reason,
      createdBy: actorId,
      createdAt: getCurrentTimestamp(),
    });
    await dataRepository.write("currency-transactions", transactions);
  });
}

export async function resetTestData(actorId: string) {
  const membership = await requireSpaceMembership(actorId);
  if (membership.role !== "owner") {
    throw new Error("OWNER만 테스트 데이터를 초기화할 수 있어요.");
  }

  await imageStorage.clearUploads();
  await dataRepository.reset();
}
