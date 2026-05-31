import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Product } from '../models/product.model';

type ProductResponse = Omit<Product, 'images'> & {
  images?: readonly string[];
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  readonly products = signal<readonly Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<readonly ProductResponse[]>('assets/data/products.json')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products.map((product) => this.withAlbum(product))),
        error: () => {
          this.products.set([]);
          this.error.set('امکان بارگذاری محصولات وجود ندارد. لطفا دوباره تلاش کنید.');
        },
      });
  }

  private withAlbum(product: ProductResponse): Product {
    return {
      ...product,
      images: product.images?.length ? product.images : [product.image, product.image, product.image],
    };
  }
}
