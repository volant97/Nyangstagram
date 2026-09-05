import "server-only";

import {
  readAllCollections,
  readCollection,
  resetAllCollections,
  withDataLock,
  writeCollection,
} from "./local-json-store";

const provider = process.env.DATA_PROVIDER ?? "local";
if (provider !== "local")
  throw new Error(`DATA_PROVIDER '${provider}' is not configured yet.`);

export const dataRepository = {
  read: readCollection,
  write: writeCollection,
  readAll: readAllCollections,
  transaction: withDataLock,
  reset: resetAllCollections,
};
