"use client";

import { useFormStatus } from "react-dom";
import type { ReactionKind, User } from "@/domain/entities";

export const REACTIONS: Array<{
  kind: ReactionKind;
  emoji: string;
  label: string;
}> = [
  { kind: "love", emoji: "❤️", label: "좋아" },
  { kind: "funny", emoji: "ㅋㅋ", label: "웃김" },
  { kind: "seen", emoji: "👀", label: "봤음" },
  { kind: "play", emoji: "🎮", label: "같이하자" },
  { kind: "sad", emoji: "😭", label: "슬픔" },
];
const COLORS = ["coral", "blue", "mint", "amber"];

export function Avatar({
  user,
  index,
  size = "normal",
}: {
  user: User;
  index: number;
  size?: "small" | "normal" | "large";
}) {
  return (
    <span
      className={`avatar avatar-${size} avatar-${COLORS[index % COLORS.length]}`}
      aria-label={`${user.nickname} 프로필`}
    >
      {user.nickname.slice(0, 1)}
    </span>
  );
}

export function SubmitButton({
  children,
  className = "primary-button",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending}>
      {pending ? "잠시만…" : children}
    </button>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="view-title">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
export function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
export function formatAgo(value?: string) {
  if (!value) return "아직 조용해요";
  const mins = Math.floor(
    Math.max(0, Date.now() - new Date(value).getTime()) / 60000,
  );
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}일 전` : formatDate(value);
}
