import catalogJson from '../assets/garments/garments.generated.json';

export type GarmentCategory = 'top' | 'bottom';

export interface GarmentItem {
  id: string;
  label: string;
  category: GarmentCategory;
  asset: string;
  thumbnail: string | null;
  anchors: string[];
  anchorMeta?: Array<{
    id: string;
    description?: string;
    position?: [number, number, number];
    normal?: [number, number, number];
  }> | null;
  license: {
    type: string;
    author: string;
    url?: string;
  } | null;
}

export interface GarmentCatalog {
  items: GarmentItem[];
  updatedAt: string;
}

const catalog = catalogJson as GarmentCatalog;

export const getGarmentCatalog = (): GarmentCatalog => catalog;

export const findGarmentById = (id: string): GarmentItem | undefined =>
  catalog.items.find((item) => item.id === id);
