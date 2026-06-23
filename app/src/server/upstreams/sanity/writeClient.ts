import { createClient } from "@sanity/client";
import { optionalEnv } from "../../env";
import { SANITY_DATASET, SANITY_PROJECT_ID } from "./config";

const writeToken = optionalEnv(
  "SANITY_WRITE",
  optionalEnv("SANITY_WRITE_TOKEN", optionalEnv("SANITY_TOKEN", ""))
);
if (!writeToken) {
  throw new Error("Missing required environment variable: SANITY_WRITE");
}

export const sanityWriteClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: optionalEnv("SANITY_API_VERSION", "2022-03-07"),
  useCdn: false,
  token: writeToken,
});
