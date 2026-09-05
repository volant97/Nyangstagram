import "server-only";

import type { Media, PostCategory, ReactionKind } from "@/domain/entities";
import { dataRepository } from "@/lib/repositories";
import { imageStorage } from "@/lib/storage/image-storage";
import {
  createEntityId,
  getCurrentTimestamp,
  requireSpaceMembership,
} from "./service-context";

type CreatePostInput = {
  content: string;
  category: PostCategory;
  images: File[];
};

export async function createPost(userId: string, input: CreatePostInput) {
  const membership = await requireSpaceMembership(userId);
  if (input.images.length > 6) {
    throw new Error("사진은 한 게시글에 최대 6장까지 올릴 수 있어요.");
  }

  const postId = createEntityId();
  const createdAt = getCurrentTimestamp();
  const savedMedia: Media[] = [];

  for (const image of input.images) {
    const storedImage = await imageStorage.save(image);
    savedMedia.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      uploaderId: userId,
      postId,
      storageKey: storedImage.storageKey,
      mimeType: storedImage.mimeType,
      createdAt,
    });
  }

  await dataRepository.transaction(async () => {
    const [posts, media, activities] = await Promise.all([
      dataRepository.read("posts"),
      dataRepository.read("media"),
      dataRepository.read("activities"),
    ]);
    posts.push({
      id: postId,
      spaceId: membership.spaceId,
      authorId: userId,
      content: input.content,
      category: input.category,
      createdAt,
    });
    media.push(...savedMedia);
    activities.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      actorId: userId,
      type: "POST_CREATED",
      targetType: "post",
      targetId: postId,
      createdAt,
    });
    await Promise.all([
      dataRepository.write("posts", posts),
      dataRepository.write("media", media),
      dataRepository.write("activities", activities),
    ]);
  });
}

export async function updatePost(
  userId: string,
  postId: string,
  content: string,
  category: PostCategory,
) {
  await requireSpaceMembership(userId);
  await dataRepository.transaction(async () => {
    const posts = await dataRepository.read("posts");
    const post = posts.find((item) => item.id === postId && !item.deletedAt);
    if (!post || post.authorId !== userId) {
      throw new Error("내 게시글만 수정할 수 있어요.");
    }

    post.content = content;
    post.category = category;
    post.updatedAt = getCurrentTimestamp();
    await dataRepository.write("posts", posts);
  });
}

export async function deletePost(userId: string, postId: string) {
  const membership = await requireSpaceMembership(userId);
  await dataRepository.transaction(async () => {
    const [posts, comments, reactions, media, activities] = await Promise.all([
      dataRepository.read("posts"),
      dataRepository.read("comments"),
      dataRepository.read("reactions"),
      dataRepository.read("media"),
      dataRepository.read("activities"),
    ]);
    const post = posts.find((item) => item.id === postId && !item.deletedAt);
    if (!post || (post.authorId !== userId && membership.role === "member")) {
      throw new Error("삭제 권한이 없어요.");
    }

    post.deletedAt = getCurrentTimestamp();
    const attachedMedia = media.filter((item) => item.postId === postId);
    await Promise.all(
      attachedMedia.map((item) => imageStorage.remove(item.storageKey)),
    );
    await Promise.all([
      dataRepository.write("posts", posts),
      dataRepository.write(
        "comments",
        comments.filter((comment) => comment.postId !== postId),
      ),
      dataRepository.write(
        "reactions",
        reactions.filter((reaction) => reaction.postId !== postId),
      ),
      dataRepository.write(
        "media",
        media.filter((item) => item.postId !== postId),
      ),
      dataRepository.write(
        "activities",
        activities.filter(
          (activity) =>
            !(activity.targetType === "post" && activity.targetId === postId),
        ),
      ),
    ]);
  });
}

export async function addComment(
  userId: string,
  postId: string,
  content: string,
) {
  const membership = await requireSpaceMembership(userId);
  const posts = await dataRepository.read("posts");
  const postExists = posts.some(
    (post) =>
      post.id === postId &&
      post.spaceId === membership.spaceId &&
      !post.deletedAt,
  );
  if (!postExists) {
    throw new Error("게시글을 찾을 수 없어요.");
  }

  await dataRepository.transaction(async () => {
    const comments = await dataRepository.read("comments");
    comments.push({
      id: createEntityId(),
      spaceId: membership.spaceId,
      postId,
      authorId: userId,
      content,
      createdAt: getCurrentTimestamp(),
    });
    await dataRepository.write("comments", comments);
  });
}

export async function reactToPost(
  userId: string,
  postId: string,
  kind: ReactionKind,
) {
  const membership = await requireSpaceMembership(userId);
  await dataRepository.transaction(async () => {
    const reactions = await dataRepository.read("reactions");
    const currentReaction = reactions.find(
      (reaction) => reaction.postId === postId && reaction.userId === userId,
    );

    if (currentReaction?.kind === kind) {
      reactions.splice(reactions.indexOf(currentReaction), 1);
    } else if (currentReaction) {
      currentReaction.kind = kind;
      currentReaction.createdAt = getCurrentTimestamp();
    } else {
      reactions.push({
        id: createEntityId(),
        spaceId: membership.spaceId,
        postId,
        userId,
        kind,
        createdAt: getCurrentTimestamp(),
      });
    }

    await dataRepository.write("reactions", reactions);
  });
}
