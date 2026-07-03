import type { Response } from "express";
import type { ListenEvent } from "@sanity/client";

import { NON_VISITOR_MASSART, STAFF_IDS, STUDENT_IDS } from "../../domain/survey/sections";
import { normalizeSurveyRow } from "../../domain/survey/normalizeSurveyRow";
import type { RawSurveyRow, SurveyRow } from "../../domain/survey/types";
import { sanityReadClient } from "../upstreams/sanity/readClient";

const PROJECTION = `
  _id, section,
  q1, q2, q3, q4, q5,
  avgWeight,
  soloMessage,
  soloMessageUpdatedAt,
  submittedAt,
  _createdAt
`;

const LISTEN_FILTER = `!(_id in path("drafts.**")) && _type == "userResponseV4"`;
const SNAPSHOT_QUERY = `*[${LISTEN_FILTER}] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`;
const MAX_ROWS = 500;
const HEARTBEAT_MS = 25_000;
const RECONNECT_DELAY_MS = 15_000;

const AGGREGATE_SECTIONS = new Set(["all", "all-massart", "all-students", "all-staff"]);
const ALLOWED_SECTIONS = new Set<string>([
  "visitor",
  ...AGGREGATE_SECTIONS,
  ...STUDENT_IDS,
  ...STAFF_IDS,
]);

interface StreamClient {
  id: number;
  section: string;
  limit: number;
  res: Response;
  heartbeat: NodeJS.Timeout;
}

let nextClientId = 1;
let rowsCache: SurveyRow[] = [];
let hasSnapshot = false;
let snapshotPromise: Promise<void> | null = null;
let listenerSubscription: { unsubscribe: () => void } | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

const clients = new Map<number, StreamClient>();

export function readSurveyResponseLimit(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(parsed)) return 300;
  return Math.max(1, Math.min(parsed, MAX_ROWS));
}

export function readSurveyResponseSection(value: unknown) {
  const section = typeof value === "string" && value.trim() ? value.trim() : "all";
  return ALLOWED_SECTIONS.has(section) ? section : null;
}

function newestTimestampOf(row: SurveyRow) {
  const raw = row.submittedAt ?? row._createdAt;
  const ts = Date.parse(raw);
  return Number.isFinite(ts) ? ts : 0;
}

function sortNewestFirst(rows: SurveyRow[]) {
  return [...rows].sort((a, b) => {
    const timeDelta = newestTimestampOf(b) - newestTimestampOf(a);
    return timeDelta !== 0 ? timeDelta : b._id.localeCompare(a._id);
  });
}

function upsertRow(rows: SurveyRow[], row: SurveyRow) {
  return sortNewestFirst([row, ...rows.filter((item) => item._id !== row._id)]).slice(0, MAX_ROWS);
}

function filterRowsForSection(rows: SurveyRow[], section: string) {
  if (!section || section === "all") return rows;
  if (section === "all-massart") {
    const allowed = new Set(NON_VISITOR_MASSART);
    return rows.filter((row) => allowed.has(row.section));
  }
  if (section === "all-students") {
    const allowed = new Set(STUDENT_IDS);
    return rows.filter((row) => allowed.has(row.section));
  }
  if (section === "all-staff") {
    const allowed = new Set(STAFF_IDS);
    return rows.filter((row) => allowed.has(row.section));
  }
  return rows.filter((row) => row.section === section);
}

function rowsForClient(client: StreamClient) {
  return filterRowsForSection(rowsCache, client.section).slice(0, client.limit);
}

function writeEvent(client: StreamClient, event: string, data: unknown) {
  try {
    client.res.write(`event: ${event}\n`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  } catch (error) {
    console.warn("[surveyResponseFeed] failed to write SSE event:", error);
    return false;
  }
}

function writeComment(client: StreamClient, comment: string) {
  try {
    client.res.write(`: ${comment}\n\n`);
    return true;
  } catch (error) {
    console.warn("[surveyResponseFeed] failed to write SSE heartbeat:", error);
    return false;
  }
}

function sendSnapshot(client: StreamClient) {
  return writeEvent(client, "snapshot", { rows: rowsForClient(client) });
}

function sendStreamError(client: StreamClient, error: unknown) {
  return writeEvent(client, "stream-error", {
    message: error instanceof Error ? error.message : "Survey response stream failed",
  });
}

function broadcastSnapshot() {
  for (const client of clients.values()) {
    if (!sendSnapshot(client)) removeClient(client.id);
  }
}

function broadcastStreamError(error: unknown) {
  for (const client of clients.values()) {
    if (!sendStreamError(client, error)) removeClient(client.id);
  }
}

async function refreshSnapshot() {
  const rawRows = await sanityReadClient.fetch<RawSurveyRow[]>(SNAPSHOT_QUERY, { limit: MAX_ROWS });
  rowsCache = sortNewestFirst(rawRows.map(normalizeSurveyRow));
  hasSnapshot = true;
  broadcastSnapshot();
}

function ensureSnapshot() {
  if (snapshotPromise) return snapshotPromise;
  snapshotPromise = refreshSnapshot().finally(() => {
    snapshotPromise = null;
  });
  return snapshotPromise;
}

function clearReconnectTimer() {
  if (!reconnectTimer) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
}

function scheduleListenerRestart() {
  if (reconnectTimer || clients.size === 0) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startSanityListener();
    void ensureSnapshot().catch((error: unknown) => {
      console.error("[surveyResponseFeed] snapshot refresh failed after reconnect:", error);
      broadcastStreamError(error);
    });
  }, RECONNECT_DELAY_MS);
}

function handleSanityEvent(event: ListenEvent<RawSurveyRow>) {
  if (event.type !== "mutation") return;

  if (!hasSnapshot) {
    void ensureSnapshot().catch((error: unknown) => {
      console.error("[surveyResponseFeed] snapshot refresh failed:", error);
      broadcastStreamError(error);
    });
    return;
  }

  if (event.transition === "disappear") {
    rowsCache = rowsCache.filter((row) => row._id !== event.documentId);
    broadcastSnapshot();
    return;
  }

  if (!event.result) {
    void ensureSnapshot().catch((error: unknown) => {
      console.error("[surveyResponseFeed] snapshot refresh failed after mutation:", error);
      broadcastStreamError(error);
    });
    return;
  }

  rowsCache = upsertRow(rowsCache, normalizeSurveyRow(event.result));
  broadcastSnapshot();
}

function startSanityListener() {
  if (listenerSubscription || clients.size === 0) return;
  clearReconnectTimer();

  listenerSubscription = sanityReadClient
    .listen<RawSurveyRow>(
      `*[${LISTEN_FILTER}]`,
      {},
      {
        includeResult: true,
        includeMutations: false,
        visibility: "query",
      }
    )
    .subscribe({
      next: handleSanityEvent,
      error: (error: unknown) => {
        console.error("[surveyResponseFeed] Sanity listener failed:", error);
        listenerSubscription = null;
        broadcastStreamError(error);
        scheduleListenerRestart();
      },
    });
}

function stopSanityListenerIfIdle() {
  if (clients.size > 0) return;
  clearReconnectTimer();
  listenerSubscription?.unsubscribe();
  listenerSubscription = null;
}

function removeClient(id: number) {
  const client = clients.get(id);
  if (!client) return;
  clearInterval(client.heartbeat);
  clients.delete(id);
  stopSanityListenerIfIdle();
}

export function openSurveyResponseStream({
  section,
  limit,
  res,
}: {
  section: string;
  limit: number;
  res: Response;
}) {
  const id = nextClientId;
  nextClientId += 1;

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const client: StreamClient = {
    id,
    section,
    limit,
    res,
    heartbeat: setInterval(() => {
      if (!writeComment(client, "heartbeat")) removeClient(id);
    }, HEARTBEAT_MS),
  };

  clients.set(id, client);
  writeComment(client, "connected");

  if (hasSnapshot) sendSnapshot(client);

  startSanityListener();
  if (!hasSnapshot || clients.size === 1) {
    void ensureSnapshot().catch((error: unknown) => {
      console.error("[surveyResponseFeed] initial snapshot failed:", error);
      sendStreamError(client, error);
    });
  }

  return () => {
    removeClient(id);
  };
}

export function upsertSurveyResponseRow(row: SurveyRow) {
  if (!hasSnapshot) return;
  rowsCache = upsertRow(rowsCache, row);
  broadcastSnapshot();
}

export function patchSurveyResponseRowMessage({
  responseId,
  soloMessage,
  soloMessageUpdatedAt,
}: {
  responseId: string;
  soloMessage?: string;
  soloMessageUpdatedAt?: string;
}) {
  if (!hasSnapshot) return;

  let changed = false;
  rowsCache = rowsCache.map((row) => {
    if (row._id !== responseId) return row;

    changed = true;
    const next = { ...row };
    if (soloMessage) {
      next.soloMessage = soloMessage;
      next.soloMessageUpdatedAt = soloMessageUpdatedAt;
    } else {
      delete next.soloMessage;
      delete next.soloMessageUpdatedAt;
    }
    return next;
  });

  if (changed) broadcastSnapshot();
}
