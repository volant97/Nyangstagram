import "server-only";

import { dataRepository } from "@/lib/repositories";
import {
  createEntityId,
  getCurrentTimestamp,
  requireSpaceMembership,
} from "./service-context";

export function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function checkIn(userId: string) {
  const membership = await requireSpaceMembership(userId);

  return dataRepository.transaction(async () => {
    const visits = await dataRepository.read("visits");
    const todayKey = getTodayKey();
    const alreadyVisited = visits.some(
      (visit) =>
        visit.userId === userId &&
        visit.spaceId === membership.spaceId &&
        visit.dayKey === todayKey,
    );

    if (alreadyVisited) {
      return { alreadyVisited: true, reward: 0 };
    }

    const createdAt = getCurrentTimestamp();
    const [transactions, activities] = await Promise.all([
      dataRepository.read("currency-transactions"),
      dataRepository.read("activities"),
    ]);

    visits.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      userId,
      dayKey: todayKey,
      createdAt,
    });
    transactions.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      userId,
      amount: 50,
      type: "DAILY_VISIT",
      reason: "오늘의 애옹즈 방문",
      createdAt,
    });
    activities.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      actorId: userId,
      type: "VISIT",
      createdAt,
    });

    await Promise.all([
      dataRepository.write("visits", visits),
      dataRepository.write("currency-transactions", transactions),
      dataRepository.write("activities", activities),
    ]);

    return { alreadyVisited: false, reward: 50 };
  });
}

type StatusInput = {
  emoji: string;
  label: string;
  game?: string;
  message?: string;
};

export async function updateStatus(userId: string, input: StatusInput) {
  const membership = await requireSpaceMembership(userId);

  await dataRepository.transaction(async () => {
    const [statuses, activities] = await Promise.all([
      dataRepository.read("user-statuses"),
      dataRepository.read("activities"),
    ]);
    const updatedAt = getCurrentTimestamp();
    const currentStatus = statuses.find(
      (status) =>
        status.userId === userId && status.spaceId === membership.spaceId,
    );

    if (currentStatus) {
      Object.assign(currentStatus, input, { updatedAt });
    } else {
      statuses.push({
        id: createEntityId(),
        spaceId: membership.spaceId,
        userId,
        ...input,
        updatedAt,
      });
    }

    activities.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      actorId: userId,
      type: "STATUS_CHANGED",
      createdAt: updatedAt,
    });

    await Promise.all([
      dataRepository.write("user-statuses", statuses),
      dataRepository.write("activities", activities),
    ]);
  });
}
