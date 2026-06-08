import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-products-list',
  imports: [RouterLink],
  templateUrl: './admin-products-list.html',
  styleUrl: './admin-products-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsListPage {
  private readonly authService = inject(AdminAuthService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly currencyFormatter = new Intl.NumberFormat('fa-IR');
  private readonly dateFormatter = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  readonly searchTerm = signal<string>('');
  readonly selectedCategory = signal<string>('all');

  readonly products = this.productService.products;
  readonly isLoading = this.productService.isLoading;
  readonly error = this.productService.error;

  readonly categories = computed<readonly string[]>(() => {
    const categories = new Set(this.products().map((product) => product.category));

    return [...categories].sort((first, second) => first.localeCompare(second));
  });

  readonly filteredProducts = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const selectedCategory = this.selectedCategory();

    return this.products().filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm);
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  });

  constructor() {
    this.productService.loadProducts(false, false);
  }

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  updateCategory(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory.set(select.value);
  }

  formatPrice(value: number): string {
    return `${this.currencyFormatter.format(value)} تومان`;
  }

  formatDate(value: string): string {
    return this.dateFormatter.format(new Date(value));
  }

  deleteProduct(productId: number): void {
    const confirmed = confirm('این محصول حذف شود؟');

    if (!confirmed) {
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      error: (error) => {
        this.productService.error.set(
          error?.error?.message ?? 'امکان حذف محصول وجود ندارد. دوباره تلاش کنید.',
        );
      },
    });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/admin/login']);
  }
}
