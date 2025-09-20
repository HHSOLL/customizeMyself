import catalogJson from '../assets/garments/garments.generated.json';

export type GarmentCategory = 'top' | 'bottom';

export interface GarmentItem {
  id: string;
  label: string;
  category: GarmentCategory;
  asset: string;
  thumbnail: string;
  anchors: string[];
  license: {
    type: string;
    author: string;
    url?: string;
  };
}

export interface GarmentCatalog {
  items: GarmentItem[];
  updatedAt: string;
}

const catalog = catalogJson as GarmentCatalog;

export const getGarmentCatalog = (): GarmentCatalog => catalog;
