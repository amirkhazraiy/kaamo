import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, ProductCard],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly numberFormatter = new Intl.NumberFormat('fa-IR');
  private readonly priceFormatter = new Intl.NumberFormat('fa-IR');

  readonly selectedImageIndex = signal<number>(0);

  readonly products = this.productService.products;
  readonly isLoading = this.productService.isLoading;
  readonly error = this.productService.error;

  readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')) || null)),
    { initialValue: null },
  );

  readonly product = computed<Product | null>(() => {
    const productId = this.productId();

    const product = productId ? this.productService.findProductById(productId) : null;

    return product?.status === 'active' ? product : null;
  });

  readonly selectedImage = computed<string | null>(() => {
    const product = this.product();

    return product?.images[this.selectedImageIndex()] ?? null;
  });

  readonly similarProducts = computed<readonly Product[]>(() => {
    const product = this.product();

    return product ? this.productService.findSimilarProducts(product) : [];
  });

  constructor() {
    this.productService.loadProducts();
  }

  formatCount(value: number): string {
    return this.numberFormatter.format(value);
  }

  formatPrice(value: number): string {
    return `${this.priceFormatter.format(value)} تومان`;
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  openProduct(product: Product): void {
    this.selectedImageIndex.set(0);
    void this.router.navigate(['/products', product.id]);
  }

  showPreviousImage(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    this.selectedImageIndex.update((index) =>
      index === 0 ? product.images.length - 1 : index - 1,
    );
  }

  showNextImage(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    this.selectedImageIndex.update((index) =>
      index === product.images.length - 1 ? 0 : index + 1,
    );
  }
}
