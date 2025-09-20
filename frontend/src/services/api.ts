const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Request failed with ${response.status}: ${text}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
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

export interface GarmentResponse {
  id: string;
  label: string;
  category: string;
  assetUrl: string;
  anchors: string[];
  license?: {
    type: string;
    author: string;
    url?: string;
  } | null;
  thumbnailUrl?: string | null;
}

export async function fetchGarments(): Promise<GarmentResponse[]> {
  const response = await safeFetch(`${API_BASE}/garments`);
  return response.json();
}

export interface MeasurementPayload {
  gender: string;
  preset?: string;
  data: Record<string, number>;
}

export async function createMeasurement(payload: MeasurementPayload): Promise<{ id: string }> {
  const fallback = () => {
    const globalCrypto =
      typeof globalThis !== 'undefined' ? (globalThis as { crypto?: Crypto }).crypto : undefined;
    const generator =
      globalCrypto && 'randomUUID' in globalCrypto
        ? globalCrypto.randomUUID()
        : Date.now().toString(36);
    const id = `local-${generator}`;
    console.warn('[api] measurements endpoint unavailable, using local profile id', id);
    return { id };
  };

  try {
    const response = await safeFetch(`${API_BASE}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  } catch (error) {
    const status =
      typeof (error as { status?: number } | null)?.status === 'number'
        ? (error as { status?: number }).status
        : undefined;
    if (status === undefined || status === 404 || status === 503) {
      return fallback();
    }
    throw error;
  }
}
