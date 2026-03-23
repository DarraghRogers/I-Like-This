export interface Item {
  id: string;
  name: string;
  barcode?: string;
  photoUri?: string;
  notes?: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  createdAt: string;
}
