import Image from "next/image";
import { Cat, KeyRound, LockKeyhole, Sparkles } from "lucide-react";
import { loginAction } from "@/app/actions";
import { NyangApp } from "@/components/nyang-app";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboard } from "@/lib/services/social-service";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ loginError?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) return <LoginScreen hasError={params.loginError === "1"} />;
  return <NyangApp data={await getDashboard(user.id)} />;
}

function LoginScreen({ hasError }: { hasError: boolean }) {
  return (
    <main className="login-page">
      <section className="login-visual" aria-label="애옹즈 소개">
        <Image
          src="/aeongz-cabin.png"
          alt="아늑한 오두막에 함께 모인 네 마리 고양이"
          fill
          priority
          sizes="(max-width: 840px) 100vw, 58vw"
        />
        <div className="login-overlay" />
        <div className="login-story">
          <div className="eyebrow">
            <Sparkles size={16} /> 우리끼리만, 조용히
          </div>
          <h1>
            게임이 달라져도
            <br />
            우리는 여기서 만나.
          </h1>
          <p>애옹즈의 오늘과 내일을 차곡차곡 모으는 작은 아지트.</p>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="brand-mark">
            <Cat size={27} strokeWidth={2.4} />
          </div>
          <div>
            <p className="wordmark">nyangstagram</p>
            <p className="login-kicker">애옹즈 전용 비밀 입구</p>
          </div>
          <form action={loginAction} className="login-form">
            <label htmlFor="code">나의 개인 코드</label>
            <div className="code-field">
              <KeyRound size={19} />
              <input
                id="code"
                name="code"
                autoComplete="off"
                autoCapitalize="characters"
                placeholder="코드를 입력해줘"
                required
              />
            </div>
            {hasError ? (
              <p className="form-error">
                앗, 코드가 맞지 않아요. 다시 확인해줘!
              </p>
            ) : null}
            <button className="primary-button" type="submit">
              아지트 들어가기 <span>→</span>
            </button>
          </form>
          <p className="privacy-note">
            <LockKeyhole size={14} /> 이 공간은 애옹즈 네 명에게만 열려 있어요.
          </p>
        </div>
      </section>
    </main>
  );
}
