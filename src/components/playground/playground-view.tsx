"use client";

import { Coins, Gift } from "lucide-react";
import type { DashboardData, User } from "@/domain/entities";
import { sendGiftAction } from "@/app/actions";
import { SectionTitle, SubmitButton } from "@/components/ui/app-primitives";

export function PlaygroundView({
  data,
  users,
}: {
  data: DashboardData;
  users: Map<string, User>;
}) {
  const others = data.users.filter((user) => user.id !== data.currentUserId);
  return (
    <div className="view-stack">
      <SectionTitle
        eyebrow="PLAYGROUND"
        title="마음을 건네는 놀이터"
        action={
          <span className="balance-chip">
            <Coins size={16} /> {data.balance.toLocaleString()}냥
          </span>
        }
      />
      <section className="play-banner">
        <div>
          <span>이번 주 작은 이벤트</span>
          <h3>서로의 근황에 반응 3번 남기기</h3>
          <p>완료하면 모두에게 보너스 100냥!</p>
        </div>
        <div className="goal-ring">
          <strong>7</strong>
          <span>/ 12</span>
        </div>
      </section>
      <div className="gift-grid">
        {data["shop-items"].map((item) => (
          <article className="gift-card" key={item.id}>
            <b>{item.emoji}</b>
            <h3>{item.name}</h3>
            <span>{item.price}냥</span>
            <details>
              <summary>선물하기</summary>
              <form action={sendGiftAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <select name="recipientId" required defaultValue="">
                  <option value="" disabled>
                    누구에게?
                  </option>
                  {others.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nickname}
                    </option>
                  ))}
                </select>
                <input
                  name="message"
                  placeholder="한마디 (선택)"
                  maxLength={100}
                />
                <SubmitButton>
                  보내기 <Gift size={15} />
                </SubmitButton>
              </form>
            </details>
          </article>
        ))}
      </div>
      <section>
        <SectionTitle title="최근 오간 선물" />
        <div className="gift-history">
          {data.gifts
            .slice(-5)
            .reverse()
            .map((gift) => {
              const item = data["shop-items"].find(
                (entry) => entry.id === gift.itemId,
              );
              return (
                <p key={gift.id}>
                  <b>{item?.emoji}</b>
                  <span>
                    <strong>{users.get(gift.senderId)?.nickname}</strong> →{" "}
                    {users.get(gift.recipientId)?.nickname}
                    <small>{gift.message || item?.name}</small>
                  </span>
                </p>
              );
            })}
          {data.gifts.length === 0 ? (
            <div className="empty-inline">
              아직 오간 선물이 없어요. 첫 마음을 건네볼까요?
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
