"use client";

import { Cat, ChevronRight, ImagePlus, Send } from "lucide-react";
import { createPostAction } from "@/app/actions";
import { SectionTitle, SubmitButton } from "@/components/ui/app-primitives";

export function CreateView({ onDone }: { onDone: () => void }) {
  return (
    <div className="view-stack">
      <SectionTitle eyebrow="NEW STORY" title="오늘을 남겨볼까?" />
      <form action={createPostAction} className="composer-card">
        <div className="composer-top">
          <span className="composer-cat">
            <Cat size={23} />
          </span>
          <textarea
            name="content"
            placeholder="애옹즈에게 무슨 이야기를 들려줄까요?"
            required
            maxLength={1000}
          />
        </div>
        <label className="upload-zone">
          <ImagePlus size={28} />
          <strong>사진을 골라줘</strong>
          <span>최대 6장 · JPG, PNG, WEBP, GIF · 장당 8MB</span>
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
          />
        </label>
        <div className="composer-bottom">
          <label>
            이야기 종류
            <select name="category" defaultValue="일상">
              {["게임", "일상", "웃긴 거", "아무말", "애옹즈"].map(
                (category) => (
                  <option key={category}>{category}</option>
                ),
              )}
            </select>
          </label>
          <SubmitButton>
            피드에 올리기 <Send size={17} />
          </SubmitButton>
        </div>
      </form>
      <button className="text-button" onClick={onDone}>
        최근 피드 보러 가기 <ChevronRight size={16} />
      </button>
    </div>
  );
}
