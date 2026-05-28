export interface SupabaseEdgeConfig {
  url: string;
  publishableKey: string;
}

interface EdgeErrorBody {
  error?: string;
  code?: string;
  resetAt?: string;
}

export class EdgeFunctionError extends Error {
  readonly code?: string;
  readonly functionName: string;
  readonly resetAt?: string;
  readonly status: number;

  constructor(functionName: string, message: string, status: number, code?: string, resetAt?: string) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.functionName = functionName;
    this.status = status;
    this.code = code;
    this.resetAt = resetAt;
  }
}

export function makeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const EDIT_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{32,128}$/;

export function isEdgeEditToken(value: string | null | undefined): value is string {
  return typeof value === 'string' && EDIT_TOKEN_PATTERN.test(value.trim());
}

export function makeEdgeEditToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  return [makeRandomId(), makeRandomId(), makeRandomId()]
    .join('-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 128);
}

export function getClientId(): string {
  if (typeof window === 'undefined') return makeRandomId();

  const key = 'be.clientId';
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;

    const next = makeRandomId();
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return makeRandomId();
  }
}

export function getSupabaseEdgeConfig(): SupabaseEdgeConfig {
  const supabaseUrl: unknown = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublishableKey: unknown =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof supabaseUrl !== 'string' || supabaseUrl.length === 0) {
    throw new Error('Missing VITE_SUPABASE_URL');
  }
  if (typeof supabasePublishableKey !== 'string' || supabasePublishableKey.length === 0) {
    throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
  };
}

function readEdgeErrorBody(value: unknown): EdgeErrorBody {
  if (!value || typeof value !== 'object') return {};
  const record = value as Record<string, unknown>;
  return {
    error: typeof record.error === 'string' ? record.error : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
    resetAt: typeof record.resetAt === 'string' ? record.resetAt : undefined,
  };
}

export function makeEdgeFunctionError(
  functionName: string,
  status: number,
  body: unknown,
  fallbackMessage: string
) {
  const edgeError = readEdgeErrorBody(body);
  return new EdgeFunctionError(
    functionName,
    edgeError.error ?? fallbackMessage,
    status,
    edgeError.code,
    edgeError.resetAt
  );
}
