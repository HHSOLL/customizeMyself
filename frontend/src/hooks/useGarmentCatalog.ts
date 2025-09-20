import { useEffect, useMemo, useState } from 'react';
import type { GarmentItem, GarmentCatalog } from '../data/garments';
import { getGarmentCatalog } from '../data/garments';
import { fetchGarments, type GarmentResponse } from '../services/api';

const fallbackCatalog = getGarmentCatalog();

const normalizeItems = (items: GarmentItem[]): GarmentItem[] =>
  items.map((item) => ({
    ...item,
    anchors: item.anchors ?? [],
    anchorMeta: item.anchorMeta ?? null,
    thumbnail: item.thumbnail ?? null,
    license: item.license ?? null,
  }));

const mapGarmentResponse = (items: GarmentResponse[]): GarmentItem[] =>
  items.map((item) => ({
    id: item.id,
    label: item.label,
    category: item.category as GarmentItem['category'],
    asset: item.assetUrl,
    anchors: item.anchors ?? [],
    anchorMeta: null,
    thumbnail: item.thumbnailUrl ?? null,
    license: item.license ?? null,
  }));

export interface UseGarmentCatalogResult {
  catalog: GarmentCatalog;
  loading: boolean;
  error: string | null;
}

export function useGarmentCatalog(): UseGarmentCatalogResult {
  const [catalog, setCatalog] = useState<GarmentCatalog>(fallbackCatalog);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchGarments();
        if (!mounted) {
          return;
        }
        if (response.length > 0) {
          setCatalog({
            items: normalizeItems(mapGarmentResponse(response)),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) {
          setError(message);
          console.warn('[catalog] falling back to static assets:', message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(
    () => ({
      catalog,
      loading,
      error,
    }),
    [catalog, loading, error],
  );
}
