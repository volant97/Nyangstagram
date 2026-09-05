import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CollectionName, DataCollections } from "@/domain/entities";
import { freshSeedData } from "@/data/seed";

const dataDirectory = path.join(process.cwd(), "data");
const globalStore = globalThis as typeof globalThis & {
  __nyangDataQueue?: Promise<void>;
};

async function ensureCollection<K extends CollectionName>(
  name: K,
): Promise<void> {
  const filePath = path.join(dataDirectory, `${name}.json`);
  try {
    await readFile(filePath, "utf8");
  } catch {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(
      filePath,
      `${JSON.stringify(freshSeedData()[name], null, 2)}\n`,
      "utf8",
    );
  }
}

export async function readCollection<K extends CollectionName>(
  name: K,
): Promise<DataCollections[K]> {
  await ensureCollection(name);
  const body = await readFile(path.join(dataDirectory, `${name}.json`), "utf8");
  return JSON.parse(body) as DataCollections[K];
}

export async function writeCollection<K extends CollectionName>(
  name: K,
  value: DataCollections[K],
): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  const destination = path.join(dataDirectory, `${name}.json`);
  const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, destination);
}

export async function withDataLock<T>(operation: () => Promise<T>): Promise<T> {
  const previous = globalStore.__nyangDataQueue ?? Promise.resolve();
  let release!: () => void;
  globalStore.__nyangDataQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous.catch(() => undefined);
  try {
    return await operation();
  } finally {
    release();
  }
}

export async function readAllCollections(): Promise<DataCollections> {
  const names = Object.keys(freshSeedData()) as CollectionName[];
  const values = await Promise.all(names.map((name) => readCollection(name)));
  return Object.fromEntries(
    names.map((name, index) => [name, values[index]]),
  ) as DataCollections;
}

export async function resetAllCollections(): Promise<void> {
  const seed = freshSeedData();
  await withDataLock(async () => {
    for (const name of Object.keys(seed) as CollectionName[])
      await writeCollection(name, seed[name]);
  });
}
