# 냥스타그램 v0.3

게임에서 만난 애옹즈 4명이 게임이 달라지거나 쉬는 동안에도 가볍게 근황을 나누는 로컬 전용 폐쇄형 SNS입니다. 이번 버전은 실제 사용 가능한 테스트 앱이면서, 검증 후 범용 비공개 SNS **오두막**으로 확장할 수 있도록 사용자·Space·저장소 경계를 미리 분리했습니다.

## 기술 스택

- Next.js 16.3.4 (App Router), React 19, TypeScript
- Tailwind CSS 4 + 프로젝트 전용 CSS 토큰
- Server Components / Server Actions / Route Handlers
- 로컬 JSON 저장소와 로컬 이미지 저장소
- `@supabase/supabase-js` (향후 Provider 구현을 위한 의존성과 진입점만 준비)

## 실행 방법

Node.js 20.19 이상을 권장합니다.

```bash
npm install
copy .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 테스트 로그인 코드

| 멤버 | 코드     | 권한   |
| ---- | -------- | ------ |
| 란뜨 | `RANTTE` | OWNER  |
| 냥몽 | `NYANG`  | MEMBER |
| 슈르 | `SHURU`  | MEMBER |
| 쿄카 | `KYOKA`  | MEMBER |

코드는 로그인 수단일 뿐 데이터 ID가 아닙니다. 서버가 코드를 내부 UUID `userId`로 교환하고, 서명된 HttpOnly 쿠키를 발급합니다. 로컬에서는 `.env.example`을 참고해 `.env.local`에 `AUTH_SECRET`과 멤버별 `LOGIN_CODE_*`를 설정하세요. 배포 환경에도 같은 변수들을 별도로 등록해야 합니다.

## 저장 위치와 초기화

- 구조화 데이터: 프로젝트 루트의 `data/*.json`
- 업로드 이미지: `storage/uploads/images/*`
- 기본 샘플 이미지: `public/aeongz-cabin.png`

각 JSON 파일은 최초 접근 시 `src/data/seed.ts`에서 생성됩니다. 쓰기는 프로세스 내 직렬화 잠금과 임시 파일 교체 방식으로 처리해 동시에 저장할 때 파일이 반쯤 쓰이는 상황을 줄였습니다. OWNER 계정의 `MY → 아지트 관리 → 테스트 데이터 초기화`에서 JSON과 사용자 업로드 파일을 초기 상태로 되돌릴 수 있습니다.

## 주요 Entity

- `User`: 변하지 않는 내부 UUID와 표시용 닉네임
- `Space`: 비공개 관계 공간. 현재는 `aeong` 하나만 노출
- `SpaceMember`: User와 Space의 다대다 관계 및 `owner | admin | member` 권한
- `Post`, `Comment`, `Reaction`, `Media`: 피드 콘텐츠와 사용자별 반응
- `Visit`, `UserStatus`: 오늘 방문과 가벼운 근황
- `Gift`, `ShopItem`: 멤버 사이의 가상 선물
- `CurrencyTransaction`: 모든 냥 획득·사용을 기록하는 원장
- `Hangout`: 게임·디스코드·영상 보기 등 같이 할 약속
- `Activity`: 알림·추억 기능에 재사용할 수 있는 주요 활동 기록

타임스탬프는 UTC ISO 8601로 저장하고 화면에서 한국 시간으로 표현합니다. ID는 배열 순번이 아니라 UUID를 사용합니다.

## 왜 인증과 userId를 분리했나

게시글·댓글·재화·선물은 로그인 코드나 닉네임이 아닌 영구 `userId`를 참조합니다. 닉네임을 바꾸거나 개인 코드 로그인을 Supabase Auth, Google, Kakao 등으로 교체해도 기존 데이터 소유권은 유지됩니다. 모든 쓰기 작업은 클라이언트가 보낸 `authorId`, `role`, `spaceId`를 신뢰하지 않고 서버에서 현재 세션과 `SpaceMember`를 다시 확인합니다.

## Space와 권한

`User`에 `spaceId`를 넣지 않고 `SpaceMember` 조인 Entity를 둡니다. 따라서 오두막 단계에서 한 사용자가 애옹즈·가족·대학 친구 공간에 동시에 가입할 수 있습니다. 현재 UI는 애옹즈만 표시하지만 Repository와 Service의 조회·쓰기는 Space 범위를 전제로 합니다. OWNER/ADMIN 판정도 닉네임 비교가 아니라 membership role로 처리합니다.

## 구조

```text
UI (src/app, src/components)
  ↓ Server Action / Route Handler
Service (src/lib/services)
  ↓
Repository (src/lib/repositories)
  ↓
Local JSON adapter (현재) / Supabase adapter (향후)

Image UI
  ↓
ImageStorage interface
  ↓
LocalImageStorage (현재) / SupabaseImageStorage (향후)
```

Provider 선택은 `DATA_PROVIDER`와 `IMAGE_STORAGE_PROVIDER`를 읽는 각 진입점 한 곳에서만 이뤄집니다. UI 컴포넌트는 환경변수, `fs`, 실제 저장 경로를 알지 못합니다.

## 삭제 정책

게시글 본문은 `deletedAt`을 남기는 soft delete를 사용합니다. 그 게시글에 종속된 댓글·반응·Media 메타데이터·업로드 파일·대상 활동은 함께 완전 삭제합니다. 사용자의 재화 원장과 선물 이력은 게시글 삭제와 무관하게 보존합니다. 테스트 데이터 초기화는 OWNER가 명시적으로 실행하는 개발용 전체 초기화입니다.

## Local → Supabase 전환 계획

1. `DATA_PROVIDER=supabase`용 Repository 구현을 추가하고 Entity를 PostgreSQL 테이블과 migration으로 매핑합니다.
2. `IMAGE_STORAGE_PROVIDER=supabase`용 Storage 구현을 추가해 `storageKey`를 버킷 키로 사용합니다.
3. Supabase Auth identity와 기존 app `userId`를 연결하는 테이블을 둡니다. Auth 사용자의 ID를 콘텐츠 소유자 ID로 직접 사용하지 않습니다.
4. 모든 테이블에 `space_id`를 유지하고 `space_members`를 기준으로 RLS를 적용합니다. 가입하지 않은 Space의 행은 조회 단계부터 반환되지 않게 합니다.
5. JSON의 UTC timestamp와 UUID는 그대로 이관하고 이후 스키마 변경은 migration으로만 관리합니다.

프로덕션 서버리스 환경에서는 인스턴스의 로컬 파일이 재배포·스케일 아웃 시 사라지거나 다른 인스턴스와 공유되지 않으므로 현재 로컬 JSON/이미지 방식을 사용할 수 없습니다. 실제 배포 전에 PostgreSQL과 객체 Storage로 전환해야 합니다.

## 향후 DM

`Conversation → ConversationMember → Message` 구조를 사용할 예정입니다. Message에 두 사용자 ID를 직접 넣지 않으므로 DM에서 그룹 채팅으로 자연스럽게 확장할 수 있습니다. 관련 TypeScript 타입은 `src/domain/entities.ts`에 설계만 남겨 두었고, 현재 UI·저장 기능은 구현하지 않았습니다.
