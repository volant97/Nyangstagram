export type SpaceRole = "owner" | "admin" | "member";
export type PostCategory = "게임" | "일상" | "웃긴 거" | "아무말" | "애옹즈";
export type ReactionKind = "love" | "funny" | "seen" | "play" | "sad";
export type HangoutResponse = "yes" | "maybe" | "no";

export type User = {
  id: string;
  nickname: string;
  avatarUrl?: string;
  title: string;
  createdAt: string;
};
export type Space = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
};
export type SpaceMember = {
  id: string;
  spaceId: string;
  userId: string;
  role: SpaceRole;
  joinedAt: string;
};
export type Post = {
  id: string;
  spaceId: string;
  authorId: string;
  content: string;
  category: PostCategory;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};
export type Media = {
  id: string;
  spaceId: string;
  uploaderId: string;
  postId: string;
  storageKey: string;
  mimeType: string;
  createdAt: string;
};
export type Comment = {
  id: string;
  spaceId: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};
export type Reaction = {
  id: string;
  spaceId: string;
  postId: string;
  userId: string;
  kind: ReactionKind;
  createdAt: string;
};
export type Visit = {
  id: string;
  spaceId: string;
  userId: string;
  dayKey: string;
  createdAt: string;
};
export type UserStatus = {
  id: string;
  spaceId: string;
  userId: string;
  emoji: string;
  label: string;
  game?: string;
  message?: string;
  updatedAt: string;
};
export type ShopItem = {
  id: string;
  spaceId: string;
  name: string;
  emoji: string;
  price: number;
  active: boolean;
};
export type Gift = {
  id: string;
  spaceId: string;
  senderId: string;
  recipientId: string;
  itemId: string;
  message?: string;
  createdAt: string;
};
export type CurrencyTransaction = {
  id: string;
  spaceId: string;
  userId: string;
  amount: number;
  type: string;
  reason?: string;
  createdBy?: string;
  createdAt: string;
};
export type Hangout = {
  id: string;
  spaceId: string;
  creatorId: string;
  title: string;
  scheduledAt: string;
  note?: string;
  responses: Array<{ userId: string; response: HangoutResponse }>;
  createdAt: string;
};
export type Activity = {
  id: string;
  spaceId: string;
  actorId: string;
  type: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
};
export type UserItem = {
  id: string;
  spaceId: string;
  userId: string;
  itemId: string;
  acquiredAt: string;
};

export type DataCollections = {
  users: User[];
  spaces: Space[];
  "space-members": SpaceMember[];
  posts: Post[];
  media: Media[];
  comments: Comment[];
  reactions: Reaction[];
  visits: Visit[];
  "user-statuses": UserStatus[];
  gifts: Gift[];
  "currency-transactions": CurrencyTransaction[];
  hangouts: Hangout[];
  activities: Activity[];
  "shop-items": ShopItem[];
  "user-items": UserItem[];
};

export type CollectionName = keyof DataCollections;
export type DashboardData = DataCollections & {
  currentUserId: string;
  currentSpaceId: string;
  balance: number;
  todayKey: string;
  canManage: boolean;
};

// Future-ready chat model: intentionally not persisted or exposed in this version.
export type Conversation = {
  id: string;
  spaceId?: string;
  type: "dm" | "group";
  createdAt: string;
};
export type ConversationMember = {
  conversationId: string;
  userId: string;
  joinedAt: string;
};
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
};
