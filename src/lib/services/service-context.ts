import "server-only";

import { AEONG_SPACE_ID } from "@/data/seed";
import type { SpaceMember } from "@/domain/entities";
import { dataRepository } from "@/lib/repositories";

export function createEntityId() {
  return crypto.randomUUID();
}

export function getCurrentTimestamp() {
  return new Date().toISOString();
}

export async function requireSpaceMembership(
  userId: string,
  spaceId = AEONG_SPACE_ID,
): Promise<SpaceMember> {
  const members = await dataRepository.read("space-members");
  const membership = members.find(
    (member) => member.userId === userId && member.spaceId === spaceId,
  );

  if (!membership) {
    throw new Error("이 아지트의 멤버가 아니에요.");
  }

  return membership;
}
