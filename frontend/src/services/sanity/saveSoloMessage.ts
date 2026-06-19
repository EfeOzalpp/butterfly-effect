import { getSessionItem, setSessionItem } from '../../app/session';
import { USE_MOCK_SANITY, shouldUseMockSanityReads } from './config';
import {
  EdgeFunctionError,
  getClientId,
  getSupabaseEdgeConfig,
  isEdgeEditToken,
  makeEdgeFunctionError,
  makeRandomId,
} from './edgeFunction';
import { updateMockSoloMessage } from './mockData';

interface SavedSoloMessage {
  _id: string;
  soloMessage?: string;
  soloMessageUpdatedAt?: string;
}

interface EdgeSoloMessagePayload {
  responseId: string;
  editToken: string;
  message: string;
  clientId: string;
  clientRequestId: string;
  website: string;
}

const MAX_MESSAGE_LENGTH = 160;

function normalizeMessage(message: string) {
  return message.trim().replace(/\s+/g, ' ').slice(0, MAX_MESSAGE_LENGTH);
}

function isSavedSoloMessage(value: unknown): value is SavedSoloMessage {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record._id === 'string';
}

function explainSoloMessageSaveError(error: EdgeFunctionError): Error {
  if (
    error.code === 'EDIT_TOKEN_MISMATCH' ||
    /invalid edit token|not allowed to edit/i.test(error.message)
  ) {
    return new Error(
      'This saved response cannot be edited from this browser. It may have been saved before message editing was enabled.'
    );
  }

  return error;
}

function persistSoloMessageSnapshot(updated: SavedSoloMessage) {
  const raw = getSessionItem('be.myDoc');
  if (!raw) return;

  try {
    const snapshot = JSON.parse(raw) as Record<string, unknown>;
    const next: Record<string, unknown> = { ...snapshot, _id: updated._id };
    if (updated.soloMessage) {
      next.soloMessage = updated.soloMessage;
      next.soloMessageUpdatedAt = updated.soloMessageUpdatedAt;
    } else {
      delete next.soloMessage;
      delete next.soloMessageUpdatedAt;
    }
    setSessionItem('be.myDoc', JSON.stringify(next));
  } catch (error) {
    console.warn('[saveSoloMessage] Failed to update local response snapshot:', error);
  }
}

export async function saveSoloMessage(message: string): Promise<SavedSoloMessage> {
  const responseId = getSessionItem('be.myEntryId');
  const editToken = getSessionItem('be.myEditToken');
  const normalized = normalizeMessage(message);

  if (!responseId || responseId.startsWith('pending-')) {
    throw new Error('Your response is still being saved. Try again in a moment.');
  }

  if (!editToken) {
    throw new Error('This browser can no longer edit that response.');
  }

  if (!isEdgeEditToken(editToken)) {
    throw new Error('This browser has an old edit token for that response. Submit a new response to enable message editing.');
  }

  if (USE_MOCK_SANITY || shouldUseMockSanityReads()) {
    const updated = updateMockSoloMessage(responseId, normalized);
    persistSoloMessageSnapshot(updated);
    return updated;
  }

  const edge = getSupabaseEdgeConfig();

  const payload: EdgeSoloMessagePayload = {
    responseId,
    editToken,
    message: normalized,
    clientId: getClientId(),
    clientRequestId: makeRandomId(),
    website: '',
  };

  const res = await fetch(`${edge.url}/functions/v1/save-solo-message`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: edge.publishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const edgeError = makeEdgeFunctionError(
      'save-solo-message',
      res.status,
      json,
      `Solo message request failed with status ${String(res.status)}`
    );
    throw explainSoloMessageSaveError(edgeError);
  }

  if (!isSavedSoloMessage(json)) {
    throw new Error('Solo message function returned an invalid response');
  }

  persistSoloMessageSnapshot(json);
  return json;
}
