import { getCurrentUser } from "@/lib/auth/session";
import { dataRepository } from "@/lib/repositories";
import { imageStorage } from "@/lib/storage/image-storage";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/media/[id]">,
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;
  const [media, members] = await Promise.all([
    dataRepository.read("media"),
    dataRepository.read("space-members"),
  ]);
  const item = media.find((entry) => entry.id === id);
  if (
    !item ||
    !members.some(
      (entry) => entry.userId === user.id && entry.spaceId === item.spaceId,
    )
  )
    return new Response("Not found", { status: 404 });
  try {
    const bytes = await imageStorage.read(item.storageKey);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": item.mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
