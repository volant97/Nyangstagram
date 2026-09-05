"use client";

import { Settings, Sparkles } from "lucide-react";
import type { DashboardData, User } from "@/domain/entities";
import { adjustCurrencyAction, resetDataAction } from "@/app/actions";
import {
  Avatar,
  formatAgo,
  SectionTitle,
  SubmitButton,
} from "@/components/ui/app-primitives";

export function MyView({
  data,
  users,
  currentUser,
}: {
  data: DashboardData;
  users: Map<string, User>;
  currentUser: User;
}) {
  const index = data.users.findIndex((user) => user.id === currentUser.id);
  const status = data["user-statuses"].find(
    (item) => item.userId === currentUser.id,
  );
  const received = data.gifts.filter(
    (gift) => gift.recipientId === currentUser.id,
  );
  const ownPosts = data.posts.filter(
    (post) => post.authorId === currentUser.id,
  );
  return (
    <div className="view-stack">
      <section className="profile-hero">
        <div className="profile-pattern" />
        <Avatar user={currentUser} index={index} size="large" />
        <div>
          <span className="role-chip">
            {data["space-members"]
              .find((member) => member.userId === currentUser.id)
              ?.role.toUpperCase()}
          </span>
          <h2>{currentUser.nickname}</h2>
          <p>{currentUser.title}</p>
          <small>
            {status?.emoji} {status?.game || status?.label}
          </small>
        </div>
        <button className="icon-button" aria-label="프로필 설정">
          <Settings size={20} />
        </button>
      </section>
      <div className="profile-stats">
        <div>
          <strong>{ownPosts.length}</strong>
          <span>작성 글</span>
        </div>
        <div>
          <strong>{received.length}</strong>
          <span>받은 선물</span>
        </div>
        <div>
          <strong>{data.balance.toLocaleString()}</strong>
          <span>보유 냥</span>
        </div>
      </div>
      <section className="panel-card">
        <SectionTitle title="받은 선물" />
        <div className="received-gifts">
          {received.map((gift) => {
            const item = data["shop-items"].find(
              (entry) => entry.id === gift.itemId,
            );
            return (
              <span
                key={gift.id}
                title={`${users.get(gift.senderId)?.nickname}에게 받음`}
              >
                {item?.emoji}
              </span>
            );
          })}
          {received.length === 0 ? <p>첫 선물을 기다리는 중이에요.</p> : null}
        </div>
      </section>
      <section className="panel-card">
        <SectionTitle title="최근 활동" />
        <div className="activity-list">
          {data.activities
            .filter((item) => item.actorId === currentUser.id)
            .slice(0, 6)
            .map((item) => (
              <p key={item.id}>
                <span>
                  <Sparkles size={15} />
                </span>
                <b>{activityLabel(item.type)}</b>
                <small>{formatAgo(item.createdAt)}</small>
              </p>
            ))}
          {data.activities.filter((item) => item.actorId === currentUser.id)
            .length === 0 ? (
            <p className="empty-inline">
              새 활동이 생기면 여기에 차곡차곡 쌓여요.
            </p>
          ) : null}
        </div>
      </section>
      {data.canManage ? <AdminPanel data={data} /> : null}
    </div>
  );
}

function AdminPanel({ data }: { data: DashboardData }) {
  return (
    <details className="admin-panel">
      <summary>
        <Settings size={18} /> 아지트 관리
      </summary>
      <div>
        <h3>냥 지급 / 차감</h3>
        <form action={adjustCurrencyAction} className="compact-form">
          <select name="targetUserId" required>
            {data.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nickname}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="amount"
            placeholder="예: 500 또는 -100"
            required
          />
          <input
            name="reason"
            placeholder="조정 사유"
            required
            maxLength={100}
          />
          <SubmitButton>장부에 기록하기</SubmitButton>
        </form>
        <div className="danger-zone">
          <div>
            <strong>테스트 데이터 초기화</strong>
            <p>게시글, 재화, 업로드 사진을 처음 상태로 되돌려요.</p>
          </div>
          <form action={resetDataAction}>
            <SubmitButton className="danger-button">초기화</SubmitButton>
          </form>
        </div>
      </div>
    </details>
  );
}

function activityLabel(type: string) {
  return (
    (
      {
        VISIT: "오늘 아지트에 다녀갔어요",
        POST_CREATED: "새 이야기를 남겼어요",
        GIFT_SENT: "멤버에게 선물을 보냈어요",
        HANGOUT_JOINED: "같이 할 약속에 답했어요",
        STATUS_CHANGED: "요즘 뭐해?를 바꿨어요",
      } as Record<string, string>
    )[type] ?? "아지트에서 활동했어요"
  );
}
