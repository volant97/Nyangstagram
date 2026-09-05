"use client";

import {
  CalendarHeart,
  Cat,
  Check,
  MoreHorizontal,
  PencilLine,
  Plus,
  Sparkles,
} from "lucide-react";
import type { DashboardData, User } from "@/domain/entities";
import {
  checkInAction,
  createHangoutAction,
  respondHangoutAction,
  updateStatusAction,
} from "@/app/actions";
import {
  Avatar,
  formatAgo,
  formatDate,
  formatTime,
  SectionTitle,
  SubmitButton,
} from "@/components/ui/app-primitives";

export function HomeView({
  data,
  users,
  visitors,
}: {
  data: DashboardData;
  users: Map<string, User>;
  visitors: Set<string>;
}) {
  const checked = visitors.has(data.currentUserId);
  return (
    <div className="view-stack">
      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> TODAY’S AEONGZ
          </span>
          <h2>오늘의 애옹즈</h2>
          <p>
            {visitors.size === 4
              ? "야호, 오늘은 네 명 모두 다녀갔어요!"
              : `오늘 ${visitors.size}명이 아지트에 발도장을 남겼어요.`}
          </p>
          <form action={checkInAction}>
            <SubmitButton
              className={checked ? "checked-button" : "light-button"}
            >
              {checked ? (
                <>
                  <Check size={18} /> 오늘 다녀감
                </>
              ) : (
                <>
                  나도 왔다가기 <span>+50냥</span>
                </>
              )}
            </SubmitButton>
          </form>
        </div>
        <div className="visit-orbit">
          {data.users.map((user, index) => (
            <div
              key={user.id}
              className={`orbit-avatar orbit-${index} ${visitors.has(user.id) ? "visited" : ""}`}
            >
              <Avatar user={user} index={index} />
              <span>{user.nickname}</span>
            </div>
          ))}
          <div className="orbit-center">
            <Cat size={28} />
            <span>{visitors.size}/4</span>
          </div>
        </div>
      </section>
      <SectionTitle
        eyebrow="QUICK STATUS"
        title="요즘 뭐해?"
        action={<span className="soft-pill">부담 없이 한 줄</span>}
      />
      <div className="status-grid">
        {data.users.map((user, index) => {
          const status = data["user-statuses"].find(
            (entry) => entry.userId === user.id,
          );
          return (
            <article className="status-card" key={user.id}>
              <div className="status-person">
                <Avatar user={user} index={index} size="small" />
                <div>
                  <strong>{user.nickname}</strong>
                  <span>{formatAgo(status?.updatedAt)}</span>
                </div>
                <MoreHorizontal size={18} />
              </div>
              <div className="status-activity">
                <b>{status?.emoji ?? "🐾"}</b>
                <div>
                  <strong>
                    {status?.game || status?.label || "조용히 쉬는 중"}
                  </strong>
                  <p>{status?.message || "아직 남긴 말이 없어요"}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <details className="inline-editor">
        <summary>
          <PencilLine size={17} /> 내 상태 바꾸기
        </summary>
        <form action={updateStatusAction} className="compact-form">
          <div className="form-row">
            <input
              name="emoji"
              defaultValue="🎮"
              aria-label="상태 이모지"
              maxLength={8}
              required
            />
            <select name="label" aria-label="현재 상태" defaultValue="게임 중">
              <option>게임 중</option>
              <option>게임 찾는 중</option>
              <option>쉬는 중</option>
              <option>일하는 중</option>
              <option>밥 먹는 중</option>
              <option>영상 보는 중</option>
              <option>아무거나</option>
            </select>
          </div>
          <input name="game" placeholder="게임 이름 (선택)" maxLength={40} />
          <input name="message" placeholder="짧은 근황 한 줄" maxLength={120} />
          <SubmitButton>상태 남기기</SubmitButton>
        </form>
      </details>
      <HangoutSection data={data} users={users} />
    </div>
  );
}

function HangoutSection({
  data,
  users,
}: {
  data: DashboardData;
  users: Map<string, User>;
}) {
  return (
    <section>
      <SectionTitle
        eyebrow="TOGETHER"
        title="같이 할 사람?"
        action={
          <span className="soft-pill">
            <CalendarHeart size={14} /> 약속 잡기
          </span>
        }
      />
      <div className="hangout-list">
        {data.hangouts.map((hangout) => (
          <article className="hangout-card" key={hangout.id}>
            <div className="hangout-date">
              <strong>{formatDate(hangout.scheduledAt)}</strong>
              <span>{formatTime(hangout.scheduledAt)}</span>
            </div>
            <div className="hangout-info">
              <span>🎮 {users.get(hangout.creatorId)?.nickname}의 제안</span>
              <h3>{hangout.title}</h3>
              <p>{hangout.note}</p>
              <div className="response-avatars">
                {hangout.responses.map((response) => (
                  <span key={response.userId}>
                    {users.get(response.userId)?.nickname} ·{" "}
                    {response.response === "yes"
                      ? "할래"
                      : response.response === "maybe"
                        ? "고민 중"
                        : "못 해"}
                  </span>
                ))}
              </div>
            </div>
            <form action={respondHangoutAction} className="response-buttons">
              <input type="hidden" name="hangoutId" value={hangout.id} />
              {[
                ["yes", "할래"],
                ["maybe", "고민"],
                ["no", "못 해"],
              ].map(([value, label]) => (
                <button name="response" value={value} key={value}>
                  {label}
                </button>
              ))}
            </form>
          </article>
        ))}
      </div>
      <details className="inline-editor">
        <summary>
          <Plus size={17} /> 새 모임 제안하기
        </summary>
        <form action={createHangoutAction} className="compact-form">
          <input
            name="title"
            placeholder="뭐 하고 놀까?"
            required
            maxLength={60}
          />
          <input name="scheduledAt" type="datetime-local" required />
          <input name="note" placeholder="짧은 메모 (선택)" maxLength={120} />
          <SubmitButton>모임 만들기</SubmitButton>
        </form>
      </details>
    </section>
  );
}
