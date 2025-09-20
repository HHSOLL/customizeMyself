import raw from '../assets/garments/garments.generated.json';

type Item = {
  id: string;
  asset: string;
  name?: string;
  category?: string;
  thumbnail?: string;
  tags?: string[];
  anchors?: string[];
  anchorMeta?: unknown;
  license?: Record<string, unknown> | null;
};

type Catalog = { items: Item[]; updatedAt?: string };

const hasItemArray = (value: unknown): value is Catalog => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { items?: unknown };
  return Array.isArray(candidate.items);
};

const catalog: Catalog = Array.isArray(raw)
  ? { items: raw as Item[] }
  : hasItemArray(raw)
    ? raw
    : { items: [] };

export const getGarmentCatalog = () => catalog;

export type GarmentItem = Item;
export type GarmentCatalog = Catalog;
