import garments from '../assets/garments/garments.sample.json';

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
  };
}

export interface GarmentCatalog {
  items: GarmentItem[];
  updatedAt: string;
}

const catalog: GarmentCatalog = {
  items: garments as GarmentItem[],
  updatedAt: new Date().toISOString(),
};

export const getGarmentCatalog = (): GarmentCatalog => catalog;
