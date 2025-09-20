const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed with ${response.status}: ${text}`);
  }
  return response;
}

export interface FitHistoryPayload {
  tier: string;
  latencyMs: number;
  garmentId?: string;
  measurementId?: string;
  degraded?: boolean;
  details?: Record<string, unknown>;
}

export async function postFitHistory(payload: FitHistoryPayload): Promise<void> {
  try {
    await safeFetch(`${API_BASE}/fit-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn('[api] failed to record fit history', error);
  }
}

export interface PresignRequest {
  filename: string;
  contentType?: string;
}

export async function requestSnapshotPresign(payload: PresignRequest) {
  const response = await safeFetch(`${API_BASE}/snapshots/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<{
    uploadUrl: string;
    fields: Record<string, string>;
    expiresIn: number;
  }>;
}
