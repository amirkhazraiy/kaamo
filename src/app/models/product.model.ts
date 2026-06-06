export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: number;
  image: string;
  images: readonly string[];
  slug?: string;
  sku: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  persons: number;
  pieces: number;
  shortDescription: string;
  fullDescription: string;
  status: ProductStatus;
  featured: boolean;
  lastUpdated: string;
}
