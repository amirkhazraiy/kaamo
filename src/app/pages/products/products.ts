import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly numberFormatter = new Intl.NumberFormat('fa-IR');

  readonly searchTerm = signal<string>('');
  readonly selectedBrand = signal<string>('all');
  readonly selectedProduct = signal<Product | null>(null);
  readonly selectedImageIndex = signal<number>(0);

  readonly products = computed<readonly Product[]>(() =>
    this.productService.products().filter((product) => product.status === 'active'),
  );
  readonly isLoading = this.productService.isLoading;
  readonly error = this.productService.error;

  readonly brands = computed<readonly string[]>(() => {
    const brandSet = new Set(this.products().map((product) => product.brand));
    return [...brandSet].sort((first, second) => first.localeCompare(second));
  });

  readonly filteredProducts = computed<readonly Product[]>(() => {
    const normalizedSearch = this.searchTerm().trim().toLowerCase();
    const brand = this.selectedBrand();

    return this.products().filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(normalizedSearch);
      const matchesBrand = brand === 'all' || product.brand === brand;

      return matchesSearch && matchesBrand;
    });
  });

  readonly selectedImage = computed<string | null>(() => {
    const product = this.selectedProduct();

    return product?.images[this.selectedImageIndex()] ?? null;
  });

  constructor() {
    this.productService.loadProducts();
  }

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  updateBrand(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedBrand.set(select.value);
  }

  formatCount(value: number): string {
    return this.numberFormatter.format(value);
  }

  openAlbum(product: Product): void {
    void this.router.navigate(['/products', product.id]);
  }

  closeAlbum(): void {
    this.selectedProduct.set(null);
    this.selectedImageIndex.set(0);
  }

  showPreviousImage(): void {
    const product = this.selectedProduct();

    if (!product) {
      return;
    }

    this.selectedImageIndex.update((index) =>
      index === 0 ? product.images.length - 1 : index - 1,
    );
  }

  showNextImage(): void {
    const product = this.selectedProduct();

    if (!product) {
      return;
    }

    this.selectedImageIndex.update((index) =>
      index === product.images.length - 1 ? 0 : index + 1,
    );
  }

  trackByProductId(_: number, product: Product): number {
    return product.id;
  }
}
