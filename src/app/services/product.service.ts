import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Product, ProductStatus } from '../models/product.model';
import { createProductSlug } from '../utils/product-slug';

type ProductResponse = Partial<Omit<Product, 'images'>> &
  Pick<Product, 'id' | 'image' | 'brand' | 'name' | 'persons' | 'pieces'> & {
    images?: readonly string[];
  };

export type ProductDraft = Omit<Product, 'id' | 'lastUpdated'> & {
  id?: number;
  lastUpdated?: string;
};

const STORAGE_KEY = 'shop_products';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private hasLoadedProducts = false;

  readonly products = signal<readonly Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadProducts(): void {
    if (this.hasLoadedProducts || this.isLoading()) {
      return;
    }

    const storedProducts = this.readStoredProducts();

    if (storedProducts.length > 0) {
      this.products.set(storedProducts);
      this.hasLoadedProducts = true;
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<readonly ProductResponse[]>('assets/data/products.json')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (products) => {
          const normalizedProducts = products.map((product) => this.normalizeProduct(product));
          this.hasLoadedProducts = true;
          this.products.set(normalizedProducts);
          this.persistProducts(normalizedProducts);
        },
        error: () => {
          this.products.set([]);
          this.error.set('امکان بارگذاری محصولات وجود ندارد. لطفا دوباره تلاش کنید.');
        },
      });
  }

  findProductById(productId: number): Product | null {
    return this.products().find((product) => product.id === productId) ?? null;
  }

  findSimilarProducts(product: Product, limit = 4): readonly Product[] {
    return this.products()
      .filter(
        (candidate) =>
          candidate.status === 'active' &&
          candidate.brand === product.brand &&
          candidate.id !== product.id,
      )
      .slice(0, limit);
  }

  getActiveProducts(): readonly Product[] {
    return this.products().filter((product) => product.status === 'active');
  }

  createProduct(productDraft: ProductDraft): Product {
    const products = this.products();
    const product = this.normalizeProduct({
      ...productDraft,
      id: this.createNextId(products),
      lastUpdated: new Date().toISOString(),
    });

    this.setProducts([...products, product]);

    return product;
  }

  updateProduct(productId: number, productDraft: ProductDraft): Product | null {
    const products = this.products();
    const currentProduct = this.findProductById(productId);

    if (!currentProduct) {
      return null;
    }

    const updatedProduct = this.normalizeProduct({
      ...currentProduct,
      ...productDraft,
      id: productId,
      lastUpdated: new Date().toISOString(),
    });

    this.setProducts(products.map((product) => (product.id === productId ? updatedProduct : product)));

    return updatedProduct;
  }

  deleteProduct(productId: number): void {
    this.setProducts(this.products().filter((product) => product.id !== productId));
  }

  isSkuTaken(sku: string, ignoredProductId?: number): boolean {
    const normalizedSku = sku.trim().toLowerCase();

    return this.products().some(
      (product) => product.id !== ignoredProductId && product.sku.toLowerCase() === normalizedSku,
    );
  }

  private setProducts(products: readonly Product[]): void {
    this.products.set(products);
    this.hasLoadedProducts = true;
    this.persistProducts(products);
  }

  private createNextId(products: readonly Product[]): number {
    return Math.max(0, ...products.map((product) => product.id)) + 1;
  }

  private normalizeProduct(product: ProductResponse | ProductDraft): Product {
    const images = product.images?.length ? product.images : [product.image, product.image, product.image];
    const status: ProductStatus = product.status ?? 'active';

    return {
      id: product.id ?? 0,
      image: product.image,
      images,
      slug: product.slug ?? createProductSlug(product),
      sku: product.sku?.trim() || `ARC-${product.id ?? Date.now()}`,
      brand: product.brand,
      name: product.name,
      category: product.category?.trim() || 'سرویس غذاخوری',
      price: product.price ?? 0,
      discountPrice: product.discountPrice ?? null,
      stock: product.stock ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      persons: product.persons,
      pieces: product.pieces,
      shortDescription:
        product.shortDescription?.trim() ||
        `${product.name}، مناسب ${product.persons} نفر با ${product.pieces} پارچه.`,
      fullDescription:
        product.fullDescription?.trim() ||
        `${product.name} از برند ${product.brand} برای استفاده روزمره و پذیرایی طراحی شده است.`,
      status,
      featured: product.featured ?? false,
      lastUpdated: product.lastUpdated ?? new Date().toISOString(),
    };
  }

  private readStoredProducts(): readonly Product[] {
    if (!this.canUseLocalStorage()) {
      return [];
    }

    const storedProducts = localStorage.getItem(STORAGE_KEY);

    if (!storedProducts) {
      return [];
    }

    try {
      const products = JSON.parse(storedProducts) as readonly ProductResponse[];

      return products.map((product) => this.normalizeProduct(product));
    } catch {
      return [];
    }
  }

  private persistProducts(products: readonly Product[]): void {
    if (!this.canUseLocalStorage()) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  private canUseLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
