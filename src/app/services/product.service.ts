import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Product, ProductStatus } from '../models/product.model';
import { createProductSlug } from '../utils/product-slug';

type ProductResponse = Partial<Omit<Product, 'images'>> &
  Pick<Product, 'id' | 'image' | 'brand' | 'name' | 'persons' | 'pieces'> & {
    images?: readonly string[];
  };

interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  category: string;
  imageUrl: string;
  imageUrls?: readonly string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sku: string | null;
  brand: string | null;
  persons: number | null;
  pieces: number | null;
  lowStockThreshold: number | null;
  featured: boolean;
}

interface ProductApiPayload {
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  category: string;
  imageUrl: string;
  imageUrls: readonly string[];
  isActive: boolean;
  sku: string;
  brand: string;
  persons: number;
  pieces: number;
  lowStockThreshold: number;
  featured: boolean;
}

interface UploadImageResponse {
  imageUrl: string;
}

export type ProductDraft = Omit<Product, 'id' | 'lastUpdated'> & {
  id?: number;
  lastUpdated?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private hasLoadedProducts = false;

  readonly products = signal<readonly Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadProducts(force = false, useStaticFallback = true): void {
    if ((!force && this.hasLoadedProducts) || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<readonly ApiProduct[]>(`${API_BASE_URL}/products`)
      .pipe(
        switchMap((products) => {
          const apiProducts = products.map((product) => this.normalizeApiProduct(product));

          if (!useStaticFallback) {
            return of(apiProducts);
          }

          return this.loadStaticProductsFallback(apiProducts);
        }),
        catchError(() => {
          if (useStaticFallback) {
            return this.loadStaticProductsFallback();
          }

          this.error.set('Unable to load products from the backend.');
          return of([]);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (products) => {
          this.hasLoadedProducts = true;
          this.products.set(products);
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

  createProduct(productDraft: ProductDraft): Observable<Product> {
    return this.http
      .post<ApiProduct>(`${API_BASE_URL}/products`, this.toApiPayload(productDraft))
      .pipe(
        map((product) => this.normalizeApiProduct(product)),
        tap((product) => {
          this.products.update((products) => [product, ...products]);
          this.hasLoadedProducts = true;
        }),
      );
  }

  updateProduct(productId: number, productDraft: ProductDraft): Observable<Product> {
    return this.http
      .patch<ApiProduct>(`${API_BASE_URL}/products/${productId}`, this.toApiPayload(productDraft))
      .pipe(
        map((product) => this.normalizeApiProduct(product)),
        tap((updatedProduct) => {
          this.products.update((products) =>
            products.map((product) => (product.id === productId ? updatedProduct : product)),
          );
        }),
      );
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http
      .delete<void>(`${API_BASE_URL}/products/${productId}`)
      .pipe(
        tap(() => {
          this.products.update((products) => products.filter((product) => product.id !== productId));
        }),
      );
  }

  uploadProductImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadImageResponse>(`${API_BASE_URL}/uploads/product-image`, formData);
  }

  isSkuTaken(sku: string, ignoredProductId?: number): boolean {
    const normalizedSku = sku.trim().toLowerCase();

    return this.products().some(
      (product) => product.id !== ignoredProductId && product.sku.toLowerCase() === normalizedSku,
    );
  }

  private loadStaticProductsFallback(baseProducts: readonly Product[] = []): Observable<readonly Product[]> {
    return this.http.get<readonly ProductResponse[]>('assets/data/products.json').pipe(
      map((products) => this.mergeStaticProducts(baseProducts, products)),
      catchError(() => {
        this.error.set('Unable to load products. Please try again.');
        return of([]);
      }),
    );
  }

  private mergeStaticProducts(
    baseProducts: readonly Product[],
    staticProducts: readonly ProductResponse[],
  ): readonly Product[] {
    const usedIds = new Set(baseProducts.map((product) => product.id));
    const usedSkus = new Set(baseProducts.map((product) => product.sku.trim().toLowerCase()));
    let nextStaticId = Math.max(100000, ...baseProducts.map((product) => product.id)) + 1;
    const normalizedStaticProducts: Product[] = [];

    for (const staticProduct of staticProducts) {
      const product = this.normalizeProduct(staticProduct);
      const normalizedSku = product.sku.trim().toLowerCase();

      if (usedSkus.has(normalizedSku)) {
        continue;
      }

      if (usedIds.has(product.id)) {
        product.id = nextStaticId;
        nextStaticId += 1;
      }

      usedIds.add(product.id);
      usedSkus.add(normalizedSku);
      normalizedStaticProducts.push(product);
    }

    return [...baseProducts, ...normalizedStaticProducts];
  }

  private toApiPayload(product: ProductDraft): ProductApiPayload {
    const imageUrls = product.images.length > 0 ? product.images : [product.image];

    return {
      title: product.name.trim(),
      description:
        product.fullDescription.trim() ||
        product.shortDescription.trim() ||
        `${product.name} product description`,
      price: product.price,
      discountPrice: product.discountPrice ?? null,
      stock: product.stock,
      category: product.category.trim(),
      imageUrl: imageUrls[0],
      imageUrls,
      isActive: product.status === 'active',
      sku: product.sku.trim(),
      brand: product.brand.trim(),
      persons: product.persons,
      pieces: product.pieces,
      lowStockThreshold: product.lowStockThreshold,
      featured: product.featured,
    };
  }

  private normalizeApiProduct(product: ApiProduct): Product {
    const brand = product.brand?.trim() || 'Arcopal';
    const name = product.title.trim();
    const images = product.imageUrls?.length
      ? product.imageUrls.map((imageUrl) => imageUrl.trim()).filter(Boolean)
      : [product.imageUrl.trim()];
    const image = images[0] || product.imageUrl.trim();

    return {
      id: product.id,
      image,
      images,
      slug: createProductSlug({ brand, name }),
      sku: product.sku?.trim() || `ARC-${product.id}`,
      brand,
      name,
      category: product.category.trim(),
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      persons: product.persons ?? 1,
      pieces: product.pieces ?? 1,
      shortDescription: product.description.slice(0, 200),
      fullDescription: product.description,
      status: product.isActive ? 'active' : 'inactive',
      featured: product.featured,
      lastUpdated: product.updatedAt,
    };
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
      category: product.category?.trim() || 'Dinnerware',
      price: product.price ?? 0,
      discountPrice: product.discountPrice ?? null,
      stock: product.stock ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      persons: product.persons,
      pieces: product.pieces,
      shortDescription:
        product.shortDescription?.trim() ||
        `${product.name}, suitable for ${product.persons} people with ${product.pieces} pieces.`,
      fullDescription:
        product.fullDescription?.trim() ||
        `${product.name} by ${product.brand} is designed for daily use and hosting.`,
      status,
      featured: product.featured ?? false,
      lastUpdated: product.lastUpdated ?? new Date().toISOString(),
    };
  }
}
