import "server-only";

import type { DashboardData } from "@/domain/entities";
import { dataRepository } from "@/lib/repositories";
import { getTodayKey } from "./presence-service";
import { requireSpaceMembership } from "./service-context";

export async function getDashboard(userId: string): Promise<DashboardData> {
  const membership = await requireSpaceMembership(userId);
  const allCollections = await dataRepository.readAll();
  const spaceId = membership.spaceId;

  const spaceCollections = {
    ...allCollections,
    spaces: allCollections.spaces.filter((space) => space.id === spaceId),
    "space-members": allCollections["space-members"].filter(
      (member) => member.spaceId === spaceId,
    ),
    posts: allCollections.posts
      .filter((post) => post.spaceId === spaceId && !post.deletedAt)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    media: allCollections.media.filter((item) => item.spaceId === spaceId),
    comments: allCollections.comments.filter(
      (comment) => comment.spaceId === spaceId && !comment.deletedAt,
    ),
    reactions: allCollections.reactions.filter(
      (reaction) => reaction.spaceId === spaceId,
    ),
    visits: allCollections.visits.filter((visit) => visit.spaceId === spaceId),
    "user-statuses": allCollections["user-statuses"].filter(
      (status) => status.spaceId === spaceId,
    ),
    gifts: allCollections.gifts.filter((gift) => gift.spaceId === spaceId),
    "currency-transactions": allCollections["currency-transactions"].filter(
      (transaction) => transaction.spaceId === spaceId,
    ),
    hangouts: allCollections.hangouts
      .filter((hangout) => hangout.spaceId === spaceId)
      .sort((first, second) =>
        first.scheduledAt.localeCompare(second.scheduledAt),
      ),
    activities: allCollections.activities
      .filter((activity) => activity.spaceId === spaceId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    "shop-items": allCollections["shop-items"].filter(
      (item) => item.spaceId === spaceId && item.active,
    ),
    "user-items": allCollections["user-items"].filter(
      (item) => item.spaceId === spaceId,
    ),
  };

  const balance = spaceCollections["currency-transactions"]
    .filter((transaction) => transaction.userId === userId)
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    ...spaceCollections,
    currentUserId: userId,
    currentSpaceId: spaceId,
    balance,
    todayKey: getTodayKey(),
    canManage: membership.role === "owner" || membership.role === "admin",
  };
}
