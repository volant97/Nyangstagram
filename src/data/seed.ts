import type { DataCollections } from "@/domain/entities";

const CREATED_AT = "2026-09-05T00:00:00.000Z";
export const AEONG_SPACE_ID = "aeong";
export const USER_IDS = {
  rantte: "7b8bf6eb-4728-44af-88cc-7a1d6fa29e61",
  nyang: "51121499-309d-4f3a-b012-720e4af67f37",
  shuru: "ae144a16-8e0b-4e09-b72f-78106d208a53",
  kyoka: "9f932c39-76c7-4830-a1ba-8ebc8ea7aafb",
} as const;

export const seedData: DataCollections = {
  users: [
    {
      id: USER_IDS.rantte,
      nickname: "란뜨",
      title: "아지트 지킴이",
      createdAt: CREATED_AT,
    },
    {
      id: USER_IDS.nyang,
      nickname: "냥몽",
      title: "몽글 수집가",
      createdAt: CREATED_AT,
    },
    {
      id: USER_IDS.shuru,
      nickname: "슈르",
      title: "느긋한 탐험가",
      createdAt: CREATED_AT,
    },
    {
      id: USER_IDS.kyoka,
      nickname: "쿄카",
      title: "새벽의 고양이",
      createdAt: CREATED_AT,
    },
  ],
  spaces: [
    {
      id: AEONG_SPACE_ID,
      name: "애옹즈",
      description: "게임이 달라져도 이어지는 작은 아지트",
      ownerId: USER_IDS.rantte,
      createdAt: CREATED_AT,
    },
  ],
  "space-members": [
    {
      id: "0b671cfa-225b-44c8-a263-5e9c9621dfa0",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.rantte,
      role: "owner",
      joinedAt: CREATED_AT,
    },
    {
      id: "ed2b68c1-d7f9-4a68-bdc9-993fe09fa58d",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.nyang,
      role: "member",
      joinedAt: CREATED_AT,
    },
    {
      id: "2c1956ad-b150-4f17-b36e-d50b94279390",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.shuru,
      role: "member",
      joinedAt: CREATED_AT,
    },
    {
      id: "cf12da88-3bca-4eca-a64d-797ce4813649",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.kyoka,
      role: "member",
      joinedAt: CREATED_AT,
    },
  ],
  posts: [
    {
      id: "64de7d7f-b0fa-4ba4-9bb0-77c74f442229",
      spaceId: AEONG_SPACE_ID,
      authorId: USER_IDS.rantte,
      content:
        "우리 넷, 게임이 달라도 여기서는 늘 같이 있자 🐾 아지트 첫 사진!",
      category: "애옹즈",
      createdAt: "2026-09-05T03:20:00.000Z",
    },
    {
      id: "3d0a279b-ad30-49b7-b8af-adf2436a31fb",
      spaceId: AEONG_SPACE_ID,
      authorId: USER_IDS.nyang,
      content:
        "요즘 퇴근하고 한 판만 하려다가 새벽 되는 중… 오늘도 접속할 사람?",
      category: "게임",
      createdAt: "2026-09-05T02:05:00.000Z",
    },
  ],
  media: [
    {
      id: "ffb7b833-8f33-47c3-af0f-bcd099c32303",
      spaceId: AEONG_SPACE_ID,
      uploaderId: USER_IDS.rantte,
      postId: "64de7d7f-b0fa-4ba4-9bb0-77c74f442229",
      storageKey: "seed:aeongz-cabin.png",
      mimeType: "image/png",
      createdAt: "2026-09-05T03:20:00.000Z",
    },
  ],
  comments: [
    {
      id: "86f4640d-f12c-480f-9619-4481295e6e42",
      spaceId: AEONG_SPACE_ID,
      postId: "64de7d7f-b0fa-4ba4-9bb0-77c74f442229",
      authorId: USER_IDS.kyoka,
      content: "이 사진 너무 우리 같잖아 ㅋㅋ",
      createdAt: "2026-09-05T03:31:00.000Z",
    },
  ],
  reactions: [
    {
      id: "d4484b81-937e-4f68-b878-c32d6cecc5cf",
      spaceId: AEONG_SPACE_ID,
      postId: "64de7d7f-b0fa-4ba4-9bb0-77c74f442229",
      userId: USER_IDS.nyang,
      kind: "love",
      createdAt: "2026-09-05T03:25:00.000Z",
    },
    {
      id: "ac28ad17-ae6f-42da-b8df-f33581326fe2",
      spaceId: AEONG_SPACE_ID,
      postId: "64de7d7f-b0fa-4ba4-9bb0-77c74f442229",
      userId: USER_IDS.shuru,
      kind: "seen",
      createdAt: "2026-09-05T03:28:00.000Z",
    },
  ],
  visits: [],
  "user-statuses": [
    {
      id: "ddbdcfcb-b74b-419d-a269-37432561e4d9",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.rantte,
      emoji: "🎮",
      label: "게임 중",
      game: "오버워치",
      message: "요즘 다시 경쟁전 하는 중",
      updatedAt: "2026-09-05T03:00:00.000Z",
    },
    {
      id: "ee9a7ca9-8376-44b0-a8c6-c01e07b584c0",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.nyang,
      emoji: "🍚",
      label: "밥 먹는 중",
      message: "마라탕 수혈 완료",
      updatedAt: "2026-09-05T02:30:00.000Z",
    },
    {
      id: "791594fa-080e-4471-8c0f-88c83526e2ac",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.shuru,
      emoji: "🌙",
      label: "쉬는 중",
      message: "오늘은 느긋하게",
      updatedAt: "2026-09-04T15:20:00.000Z",
    },
    {
      id: "011dce0e-78f9-4d21-b4b2-84f8c23c781a",
      spaceId: AEONG_SPACE_ID,
      userId: USER_IDS.kyoka,
      emoji: "📺",
      label: "영상 보는 중",
      message: "볼 거 추천받아요",
      updatedAt: "2026-09-05T01:10:00.000Z",
    },
  ],
  gifts: [],
  "currency-transactions": Object.values(USER_IDS).map((userId, index) => ({
    id: `00000000-0000-4000-8000-00000000000${index + 1}`,
    spaceId: AEONG_SPACE_ID,
    userId,
    amount: 1200,
    type: "WELCOME",
    reason: "아지트 입주 선물",
    createdAt: CREATED_AT,
  })),
  hangouts: [
    {
      id: "493c9f57-6401-4eaf-a28d-b0afbf61d84c",
      spaceId: AEONG_SPACE_ID,
      creatorId: USER_IDS.rantte,
      title: "금요일 밤 같이 게임",
      scheduledAt: "2026-09-11T13:00:00.000Z",
      note: "게임은 그날 정하기",
      responses: [
        { userId: USER_IDS.rantte, response: "yes" },
        { userId: USER_IDS.nyang, response: "maybe" },
      ],
      createdAt: "2026-09-05T03:10:00.000Z",
    },
  ],
  activities: [],
  "shop-items": [
    {
      id: "gift-coffee",
      spaceId: AEONG_SPACE_ID,
      name: "따끈 커피",
      emoji: "☕",
      price: 180,
      active: true,
    },
    {
      id: "gift-cake",
      spaceId: AEONG_SPACE_ID,
      name: "조각 케이크",
      emoji: "🍰",
      price: 260,
      active: true,
    },
    {
      id: "gift-fish",
      spaceId: AEONG_SPACE_ID,
      name: "통통 고등어",
      emoji: "🐟",
      price: 320,
      active: true,
    },
    {
      id: "gift-chicken",
      spaceId: AEONG_SPACE_ID,
      name: "바삭 닭다리",
      emoji: "🍗",
      price: 420,
      active: true,
    },
    {
      id: "gift-flower",
      spaceId: AEONG_SPACE_ID,
      name: "작은 꽃다발",
      emoji: "💐",
      price: 560,
      active: true,
    },
    {
      id: "gift-crown",
      spaceId: AEONG_SPACE_ID,
      name: "반짝 왕관",
      emoji: "👑",
      price: 900,
      active: true,
    },
  ],
  "user-items": [],
};

export function freshSeedData(): DataCollections {
  return structuredClone(seedData);
}
