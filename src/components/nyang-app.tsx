"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { checkInToolAction } from "@/app/actions";
import { FeedView } from "@/components/feed/feed-view";
import { HomeView } from "@/components/home/home-view";
import {
  AppHeader,
  AppSidebar,
  type AppTab,
  BottomNavigation,
  MemberRail,
} from "@/components/layout/app-navigation";
import { PlaygroundView } from "@/components/playground/playground-view";
import { CreateView } from "@/components/post/create-view";
import { MyView } from "@/components/profile/my-view";
import type { DashboardData } from "@/domain/entities";

export function NyangApp({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const router = useRouter();
  const users = useMemo(
    () => new Map(data.users.map((user) => [user.id, user])),
    [data.users],
  );
  const currentUser = users.get(data.currentUserId)!;
  const currentUserIndex = data.users.findIndex(
    (user) => user.id === currentUser.id,
  );
  const todayVisitors = new Set(
    data.visits
      .filter((visit) => visit.dayKey === data.todayKey)
      .map((visit) => visit.userId),
  );

  useEffect(() => {
    const modelContext = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options?: { signal?: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;

    if (!modelContext?.registerTool) return;

    const lifecycle = new AbortController();
    void Promise.resolve(
      modelContext.registerTool(
        {
          name: "check_in_today",
          title: "오늘 다녀가기",
          description:
            "현재 로그인한 멤버의 오늘 방문을 기록하고 첫 방문이면 50냥을 지급합니다.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: async () => {
            const result = await checkInToolAction();
            router.refresh();
            return result;
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, [router]);

  function toggleTheme() {
    const useDarkTheme = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", useDarkTheme);
    localStorage.setItem(
      "nyang-theme-v1",
      JSON.stringify(useDarkTheme ? "dark" : "light"),
    );
  }

  return (
    <div className="app-shell">
      <AppSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleTheme={toggleTheme}
      />
      <div className="app-content">
        <AppHeader
          activeTab={activeTab}
          currentUser={currentUser}
          currentUserIndex={currentUserIndex}
          onGoHome={() => setActiveTab("home")}
          onToggleTheme={toggleTheme}
        />
        <main className="main-grid">
          <section className="main-column">
            {activeTab === "home" ? (
              <HomeView data={data} users={users} visitors={todayVisitors} />
            ) : null}
            {activeTab === "feed" ? (
              <FeedView data={data} users={users} />
            ) : null}
            {activeTab === "create" ? (
              <CreateView onDone={() => setActiveTab("feed")} />
            ) : null}
            {activeTab === "playground" ? (
              <PlaygroundView data={data} users={users} />
            ) : null}
            {activeTab === "my" ? (
              <MyView data={data} users={users} currentUser={currentUser} />
            ) : null}
          </section>
          <MemberRail data={data} todayVisitors={todayVisitors} />
        </main>
      </div>
      <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
