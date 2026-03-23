// src/services/sanity/client.ts
import { createClient } from "@sanity/client";

const config = {
  projectId: "2dnm6wwp",
  dataset: "butterfly-habits",
  apiVersion: "2022-03-07",
} as const;

// IMPORTANT: derive the type from createClient
export type SanityLiveClient = ReturnType<typeof createClient>;

export const cdnClient: SanityLiveClient = createClient({ ...config, useCdn: true });
export const liveReadClient: SanityLiveClient = createClient({ ...config, useCdn: false });
