"use client";

import type { ComponentType } from "react";
import {
  Bell,
  Cat,
  CircleUserRound,
  Coins,
  Gamepad2,
  Home,
  ImagePlus,
  LogOut,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { logoutAction } from "@/app/actions";
import { Avatar } from "@/components/ui/app-primitives";
import { DISPLAY_VERSION } from "@/config/app-metadata";
import type { DashboardData, User } from "@/domain/entities";

export type AppTab = "home" | "feed" | "create" | "playground" | "my";

type NavigationItem = {
  id: AppTab;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

const navigationItems: NavigationItem[] = [
  { id: "home", label: "홈", icon: Home },
  { id: "feed", label: "피드", icon: ImagePlus },
  { id: "create", label: "작성", icon: Plus },
  { id: "playground", label: "놀이터", icon: Gamepad2 },
  { id: "my", label: "MY", icon: CircleUserRound },
];

type NavigationProps = {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
};

export function AppSidebar({
  activeTab,
  onSelectTab,
  onToggleTheme,
}: NavigationProps & { onToggleTheme: () => void }) {
  return (
    <aside className="sidebar">
      <Brand onClick={() => onSelectTab("home")} />
      <nav className="nav-list" aria-label="주 메뉴">
        {navigationItems.map((item) => (
          <NavigationButton
            key={item.id}
            item={item}
            active={activeTab === item.id}
            onClick={() => onSelectTab(item.id)}
          />
        ))}
      </nav>
      <div className="sidebar-foot">
        <button className="plain-row" onClick={onToggleTheme}>
          <Moon className="theme-moon" size={19} />
          <Sun className="theme-sun" size={19} />
          <span className="theme-moon">다크 모드</span>
          <span className="theme-sun">라이트 모드</span>
        </button>
        <form action={logoutAction}>
          <button className="plain-row" type="submit">
            <LogOut size={19} /> 로그아웃
          </button>
        </form>
        <p>애옹즈 · PRIVATE · {DISPLAY_VERSION}</p>
      </div>
    </aside>
  );
}

export function AppHeader({
  activeTab,
  currentUser,
  currentUserIndex,
  onGoHome,
  onToggleTheme,
}: {
  activeTab: AppTab;
  currentUser: User;
  currentUserIndex: number;
  onGoHome: () => void;
  onToggleTheme: () => void;
}) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <Brand showVersion onClick={onGoHome} />
      </div>
      <div className="topbar-copy">
        <h1>{navigationItems.find((item) => item.id === activeTab)?.label}</h1>
        <p>
          {activeTab === "home"
            ? `${currentUser.nickname}, 오늘도 잘 왔어!`
            : "우리의 작은 아지트"}
        </p>
      </div>
      <div className="topbar-actions">
        <button
          className="icon-button"
          onClick={onToggleTheme}
          aria-label="테마 전환"
        >
          <Moon className="theme-moon" size={20} />
          <Sun className="theme-sun" size={20} />
        </button>
        <button className="icon-button" aria-label="알림">
          <Bell size={20} />
          <i />
        </button>
        <Avatar user={currentUser} size="small" index={currentUserIndex} />
      </div>
    </header>
  );
}

export function MemberRail({
  data,
  todayVisitors,
}: {
  data: DashboardData;
  todayVisitors: Set<string>;
}) {
  return (
    <aside className="right-rail">
      <div className="rail-balance">
        <div>
          <span>내 보유 냥</span>
          <strong>
            {data.balance.toLocaleString()} <small>냥</small>
          </strong>
        </div>
        <div className="coin-badge">
          <Coins size={23} />
        </div>
      </div>
      <section className="rail-card">
        <div className="section-heading">
          <h3>우리 멤버</h3>
          <span>{todayVisitors.size}/4 방문</span>
        </div>
        <div className="member-list">
          {data.users.map((user, index) => (
            <div className="member-row" key={user.id}>
              <Avatar user={user} size="small" index={index} />
              <div>
                <strong>{user.nickname}</strong>
                <span>
                  {data["user-statuses"].find(
                    (status) => status.userId === user.id,
                  )?.label ?? "아직 조용해요"}
                </span>
              </div>
              <i className={todayVisitors.has(user.id) ? "online" : ""} />
            </div>
          ))}
        </div>
      </section>
      <p className="rail-quote">
        “게임이 달라져도
        <br />
        계속 이어지는 우리.” <Cat size={20} />
      </p>
    </aside>
  );
}

export function BottomNavigation({ activeTab, onSelectTab }: NavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="모바일 주 메뉴">
      {navigationItems.map((item) => (
        <NavigationButton
          key={item.id}
          item={item}
          active={activeTab === item.id}
          onClick={() => onSelectTab(item.id)}
        />
      ))}
    </nav>
  );
}

function Brand({
  showVersion = false,
  onClick,
}: {
  showVersion?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="brand brand-button"
      onClick={onClick}
      aria-label="홈으로 이동"
    >
      <span className="brand-icon">
        <Cat size={24} />
      </span>
      <div>
        <strong>nyangstagram</strong>
        <small>{showVersion ? DISPLAY_VERSION : "애옹즈 아지트"}</small>
      </div>
    </button>
  );
}

function NavigationButton({
  item,
  active,
  onClick,
}: {
  item: NavigationItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      className={`nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      <span>{item.label}</span>
      {item.id === "create" ? <b /> : null}
    </button>
  );
}
