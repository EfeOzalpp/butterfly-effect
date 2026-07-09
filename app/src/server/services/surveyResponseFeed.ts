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
const SNAPSHOT_PAGE_QUERY = `*[${LISTEN_FILTER} && (
  !defined($cursorTime) ||
  coalesce(submittedAt, _createdAt) < $cursorTime ||
  (coalesce(submittedAt, _createdAt) == $cursorTime && _id < $cursorId)
)] | order(coalesce(submittedAt, _createdAt) desc, _id desc)[0...$limit]{ ${PROJECTION} }`;
const DEFAULT_ROWS_LIMIT = 300;
const MAX_NUMERIC_ROWS_LIMIT = 5000;
const SNAPSHOT_CHUNK_SIZE = 250;
const PATCH_COALESCE_MS = 750;
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
  limit: SurveyResponseLimit;
  res: Response;
  heartbeat: NodeJS.Timeout;
}

type SurveyResponseLimit = number | "all";

interface SnapshotCursor {
  time: string;
  id: string;
}

let nextClientId = 1;
let rowsCache: SurveyRow[] = [];
let hasSnapshot = false;
let snapshotPromise: Promise<void> | null = null;
let listenerSubscription: { unsubscribe: () => void } | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let patchTimer: NodeJS.Timeout | null = null;
const pendingUpserts = new Map<string, SurveyRow>();
const pendingDeletes = new Set<string>();

const clients = new Map<number, StreamClient>();

export function readSurveyResponseLimit(value: unknown): SurveyResponseLimit {
  if (value === "all") return "all";
  const parsed = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(parsed)) return DEFAULT_ROWS_LIMIT;
  return Math.max(1, Math.min(parsed, MAX_NUMERIC_ROWS_LIMIT));
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
  return sortNewestFirst([row, ...rows.filter((item) => item._id !== row._id)]);
}

function mergeRows(rows: SurveyRow[], nextRows: SurveyRow[]) {
  const byId = new Map(rows.map((row) => [row._id, row]));
  for (const row of nextRows) byId.set(row._id, row);
  return sortNewestFirst([...byId.values()]);
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
  const rows = filterRowsForSection(rowsCache, client.section);
  return client.limit === "all" ? rows : rows.slice(0, client.limit);
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

function sendStreamError(client: StreamClient, error: unknown) {
  return writeEvent(client, "stream-error", {
    message: error instanceof Error ? error.message : "Survey response stream failed",
  });
}

function sendSnapshotChunk(
  client: StreamClient,
  rows: SurveyRow[],
  {
    reset = false,
    complete = false,
  }: {
    reset?: boolean;
    complete?: boolean;
  } = {}
) {
  return writeEvent(client, "snapshot", { rows, reset, complete });
}

function sendCachedSnapshot(client: StreamClient, completeWhenDone: boolean) {
  const rows = rowsForClient(client);
  if (!rows.length) {
    return sendSnapshotChunk(client, [], { reset: true, complete: completeWhenDone });
  }

  for (let index = 0; index < rows.length; index += SNAPSHOT_CHUNK_SIZE) {
    const chunk = rows.slice(index, index + SNAPSHOT_CHUNK_SIZE);
    const complete = completeWhenDone && index + SNAPSHOT_CHUNK_SIZE >= rows.length;
    if (!sendSnapshotChunk(client, chunk, { reset: index === 0, complete })) return false;
  }

  return true;
}

function broadcastSnapshotChunk(
  rows: SurveyRow[],
  {
    reset = false,
    complete = false,
  }: {
    reset?: boolean;
    complete?: boolean;
  } = {}
) {
  for (const client of clients.values()) {
    const clientRows = filterRowsForSection(rows, client.section);
    if (!sendSnapshotChunk(client, clientRows, { reset, complete })) removeClient(client.id);
  }
}

function broadcastStreamError(error: unknown) {
  for (const client of clients.values()) {
    if (!sendStreamError(client, error)) removeClient(client.id);
  }
}

async function refreshSnapshot() {
  rowsCache = [];
  hasSnapshot = false;

  let cursor: SnapshotCursor | null = null;
  let sentAnyChunk = false;

  while (clients.size > 0) {
    const rawRows: RawSurveyRow[] = await sanityReadClient.fetch<RawSurveyRow[]>(SNAPSHOT_PAGE_QUERY, {
      limit: SNAPSHOT_CHUNK_SIZE,
      cursorTime: cursor?.time ?? null,
      cursorId: cursor?.id ?? null,
    });
    const rows: SurveyRow[] = rawRows.map(normalizeSurveyRow);
    const complete = rows.length < SNAPSHOT_CHUNK_SIZE;

    rowsCache = mergeRows(rowsCache, rows);
    broadcastSnapshotChunk(rows, { reset: !sentAnyChunk, complete });
    sentAnyChunk = true;

    if (complete || rows.length === 0) break;

    const last: SurveyRow = rows[rows.length - 1];
    cursor = {
      time: last.submittedAt ?? last._createdAt,
      id: last._id,
    };
  }

  if (!sentAnyChunk) {
    broadcastSnapshotChunk([], { reset: true, complete: true });
  }

  hasSnapshot = true;
  flushPendingPatch();
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

function flushPendingPatch() {
  if (patchTimer) {
    clearTimeout(patchTimer);
    patchTimer = null;
  }

  const upserts = [...pendingUpserts.values()];
  const deletes = [...pendingDeletes];
  pendingUpserts.clear();
  pendingDeletes.clear();

  if (!upserts.length && !deletes.length) return;

  for (const client of clients.values()) {
    const clientUpserts = filterRowsForSection(upserts, client.section);
    const payload = {
      ...(clientUpserts.length ? { upserts: clientUpserts } : {}),
      ...(deletes.length ? { deletes } : {}),
    };
    if (!clientUpserts.length && !deletes.length) continue;
    if (!writeEvent(client, "patch", payload)) removeClient(client.id);
  }
}

function queuePatch({
  upserts = [],
  deletes = [],
}: {
  upserts?: SurveyRow[];
  deletes?: string[];
}) {
  for (const id of deletes) {
    pendingUpserts.delete(id);
    pendingDeletes.add(id);
  }

  for (const row of upserts) {
    pendingDeletes.delete(row._id);
    pendingUpserts.set(row._id, row);
  }

  if (patchTimer || clients.size === 0 || snapshotPromise || !hasSnapshot) return;
  patchTimer = setTimeout(flushPendingPatch, PATCH_COALESCE_MS);
}

function handleSanityEvent(event: ListenEvent<RawSurveyRow>) {
  if (event.type !== "mutation") return;

  if (event.transition === "disappear") {
    rowsCache = rowsCache.filter((row) => row._id !== event.documentId);
    queuePatch({ deletes: [event.documentId] });
    return;
  }

  if (!event.result) {
    void ensureSnapshot().catch((error: unknown) => {
      console.error("[surveyResponseFeed] snapshot refresh failed after mutation:", error);
      broadcastStreamError(error);
    });
    return;
  }

  const row = normalizeSurveyRow(event.result);
  rowsCache = upsertRow(rowsCache, row);
  queuePatch({ upserts: [row] });
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
  flushPendingPatch();
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
  limit: SurveyResponseLimit;
  res: Response;
}) {
  const id = nextClientId;
  nextClientId += 1;

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

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

  const isFirstClient = clients.size === 1;
  if (!isFirstClient && (hasSnapshot || rowsCache.length > 0)) {
    sendCachedSnapshot(client, !snapshotPromise);
  }

  startSanityListener();
  if (!hasSnapshot || isFirstClient) {
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
  rowsCache = upsertRow(rowsCache, row);
  queuePatch({ upserts: [row] });
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
  const index = rowsCache.findIndex((row) => row._id === responseId);
  if (index < 0) return;

  const next = { ...rowsCache[index] };
  if (soloMessage) {
    next.soloMessage = soloMessage;
    next.soloMessageUpdatedAt = soloMessageUpdatedAt;
  } else {
    delete next.soloMessage;
    delete next.soloMessageUpdatedAt;
  }

  rowsCache = [
    ...rowsCache.slice(0, index),
    next,
    ...rowsCache.slice(index + 1),
  ];
  queuePatch({ upserts: [next] });
}
