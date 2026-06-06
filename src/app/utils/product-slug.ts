import { Product } from '../models/product.model';

const persianDigitMap = new Map<string, string>([
  ['۰', '0'],
  ['۱', '1'],
  ['۲', '2'],
  ['۳', '3'],
  ['۴', '4'],
  ['۵', '5'],
  ['۶', '6'],
  ['۷', '7'],
  ['۸', '8'],
  ['۹', '9'],
]);

export function createProductSlug(product: Pick<Product, 'brand' | 'name'>): string {
  return `${product.brand}-${product.name}`
    .trim()
    .replace(/[۰-۹]/g, (digit) => persianDigitMap.get(digit) ?? digit)
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
