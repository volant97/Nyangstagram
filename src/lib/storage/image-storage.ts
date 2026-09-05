import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export interface ImageStorage {
  save(file: File): Promise<{ storageKey: string; mimeType: string }>;
  read(storageKey: string): Promise<Buffer>;
  remove(storageKey: string): Promise<void>;
  clearUploads(): Promise<void>;
}

class LocalImageStorage implements ImageStorage {
  private readonly root = path.join(
    process.cwd(),
    "storage",
    "uploads",
    "images",
  );

  async save(file: File) {
    const extension = allowedTypes.get(file.type);
    if (!extension)
      throw new Error("JPG, PNG, WEBP, GIF 이미지만 올릴 수 있어요.");
    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE)
      throw new Error("이미지는 한 장당 8MB 이하여야 해요.");
    await mkdir(this.root, { recursive: true });
    const storageKey = `${crypto.randomUUID()}.${extension}`;
    await writeFile(
      path.join(/* turbopackIgnore: true */ this.root, storageKey),
      Buffer.from(await file.arrayBuffer()),
    );
    return { storageKey, mimeType: file.type };
  }

  async read(storageKey: string) {
    if (storageKey.startsWith("seed:"))
      return readFile(path.join(process.cwd(), "public", storageKey.slice(5)));
    if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(storageKey))
      throw new Error("Invalid storage key");
    return readFile(
      path.join(/* turbopackIgnore: true */ this.root, storageKey),
    );
  }

  async remove(storageKey: string) {
    if (!storageKey.startsWith("seed:"))
      await rm(path.join(/* turbopackIgnore: true */ this.root, storageKey), {
        force: true,
      });
  }

  async clearUploads() {
    await rm(this.root, { recursive: true, force: true });
    await mkdir(this.root, { recursive: true });
  }
}

const provider = process.env.IMAGE_STORAGE_PROVIDER ?? "local";
if (provider !== "local")
  throw new Error(
    `IMAGE_STORAGE_PROVIDER '${provider}' is not configured yet.`,
  );
export const imageStorage: ImageStorage = new LocalImageStorage();
