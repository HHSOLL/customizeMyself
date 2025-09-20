import raw from '../assets/garments/garments.generated.json';

type GarmentLicense = {
  type?: string;
  author?: string;
  url?: string;
  [key: string]: unknown;
};

type Item = {
  id: string;
  asset: string;
  name?: string;
  label?: string;
  category?: string;
  thumbnail?: string | null;
  tags?: string[];
  anchors?: string[];
  anchorMeta?: unknown | null;
  license?: GarmentLicense | null;
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
export type GarmentLicenseInfo = GarmentLicense;
export type GarmentCatalog = Catalog;
