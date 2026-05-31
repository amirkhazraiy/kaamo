import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Product } from '../models/product.model';

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
      .get<readonly Product[]>('assets/data/products.json')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
        error: () => {
          this.products.set([]);
          this.error.set('امکان بارگذاری محصولات وجود ندارد. لطفا دوباره تلاش کنید.');
        },
      });
  }
}
