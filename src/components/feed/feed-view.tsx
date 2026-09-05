"use client";

import Image from "next/image";
import {
  Cat,
  MoreHorizontal,
  PencilLine,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type {
  DashboardData,
  Post,
  PostCategory,
  User,
} from "@/domain/entities";
import {
  addCommentAction,
  deletePostAction,
  reactAction,
  updatePostAction,
} from "@/app/actions";
import {
  Avatar,
  formatAgo,
  REACTIONS,
  SectionTitle,
  SubmitButton,
} from "@/components/ui/app-primitives";

export function FeedView({
  data,
  users,
}: {
  data: DashboardData;
  users: Map<string, User>;
}) {
  const [category, setCategory] = useState<"전체" | PostCategory>("전체");
  const visible =
    category === "전체"
      ? data.posts
      : data.posts.filter((post) => post.category === category);
  return (
    <div className="view-stack">
      <SectionTitle
        eyebrow="AEONGZ FEED"
        title="우리의 요즘"
        action={
          <span className="soft-pill">
            <Plus size={15} /> 새 이야기
          </span>
        }
      />
      <div className="category-tabs">
        {["전체", "게임", "일상", "웃긴 거", "아무말", "애옹즈"].map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item as typeof category)}
            className={category === item ? "active" : ""}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="feed-list">
        {visible.map((post) => (
          <PostCard key={post.id} post={post} data={data} users={users} />
        ))}
        {visible.length === 0 ? (
          <div className="empty-card">
            <Cat size={35} />
            <h3>아직 이야기가 없어요</h3>
            <p>첫 번째 근황을 남겨볼까요?</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PostCard({
  post,
  data,
  users,
}: {
  post: Post;
  data: DashboardData;
  users: Map<string, User>;
}) {
  const author = users.get(post.authorId)!;
  const authorIndex = data.users.findIndex((u) => u.id === author.id);
  const media = data.media.filter((item) => item.postId === post.id);
  const comments = data.comments.filter((item) => item.postId === post.id);
  const reactions = data.reactions.filter((item) => item.postId === post.id);
  return (
    <article className="post-card">
      <header className="post-head">
        <Avatar user={author} index={authorIndex} />
        <div>
          <strong>{author.nickname}</strong>
          <span>
            {formatAgo(post.createdAt)} · <b>#{post.category}</b>
            {post.updatedAt ? " · 수정됨" : ""}
          </span>
        </div>
        {post.authorId === data.currentUserId || data.canManage ? (
          <details className="post-menu">
            <summary aria-label="게시글 메뉴">
              <MoreHorizontal size={19} />
            </summary>
            <div>
              <details>
                <summary>
                  <PencilLine size={15} /> 수정
                </summary>
                <form action={updatePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <textarea
                    name="content"
                    defaultValue={post.content}
                    required
                    maxLength={1000}
                  />
                  <select name="category" defaultValue={post.category}>
                    {["게임", "일상", "웃긴 거", "아무말", "애옹즈"].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      ),
                    )}
                  </select>
                  <SubmitButton>저장</SubmitButton>
                </form>
              </details>
              <form action={deletePostAction}>
                <input type="hidden" name="postId" value={post.id} />
                <button className="danger-link">
                  <Trash2 size={15} /> 삭제
                </button>
              </form>
            </div>
          </details>
        ) : null}
      </header>
      <p className="post-copy">{post.content}</p>
      {media.length ? (
        <div className={`media-grid media-${Math.min(media.length, 4)}`}>
          {media.map((item) => (
            <div className="media-frame" key={item.id}>
              <Image
                src={`/api/media/${item.id}`}
                alt={`${author.nickname}님의 게시 사진`}
                fill
                sizes="(max-width: 720px) 100vw, 620px"
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : null}
      <div className="reaction-summary">
        <div className="reaction-faces">
          {REACTIONS.filter((item) =>
            reactions.some((reaction) => reaction.kind === item.kind),
          )
            .slice(0, 3)
            .map((item) => (
              <span key={item.kind}>{item.emoji}</span>
            ))}
        </div>
        <span>
          {reactions.length
            ? `${reactions.length}명이 반응했어요`
            : "첫 반응을 남겨줘요"}
        </span>
        <span>{comments.length}개의 댓글</span>
      </div>
      <div className="reaction-bar">
        {REACTIONS.map((item) => {
          const active = reactions.some(
            (reaction) =>
              reaction.userId === data.currentUserId &&
              reaction.kind === item.kind,
          );
          return (
            <form action={reactAction} key={item.kind}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="kind" value={item.kind} />
              <button className={active ? "active" : ""} title={item.label}>
                <span>{item.emoji}</span>
                <b>
                  {reactions.filter((reaction) => reaction.kind === item.kind)
                    .length || ""}
                </b>
              </button>
            </form>
          );
        })}
      </div>
      {comments.length ? (
        <div className="comments">
          {comments.slice(-3).map((comment) => (
            <p key={comment.id}>
              <strong>{users.get(comment.authorId)?.nickname}</strong>{" "}
              {comment.content}
            </p>
          ))}
        </div>
      ) : null}
      <form action={addCommentAction} className="comment-form">
        <input type="hidden" name="postId" value={post.id} />
        <input
          name="content"
          placeholder="다정한 댓글을 남겨줘"
          maxLength={240}
          required
        />
        <button aria-label="댓글 보내기">
          <Send size={17} />
        </button>
      </form>
    </article>
  );
}
