export interface Product {
  id: number;
  image: string;
  images: readonly string[];
  brand: string;
  name: string;
  persons: number;
  pieces: number;
}
