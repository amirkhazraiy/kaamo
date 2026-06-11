import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductCard, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly numberFormatter = new Intl.NumberFormat('fa-IR');
  private loginRedirectTimer: ReturnType<typeof setTimeout> | null = null;

  readonly searchTerm = signal<string>('');
  readonly selectedBrand = signal<string>('all');
  readonly selectedCategory = signal<string>('all');
  readonly selectedProduct = signal<Product | null>(null);
  readonly selectedImageIndex = signal<number>(0);
  readonly loginModalOpen = signal<boolean>(false);
  readonly phoneNumber = signal<string>('');
  readonly loginError = signal<string | null>(null);
  readonly loginSuccessMessage = signal<string | null>(null);

  readonly products = computed<readonly Product[]>(() =>
    this.productService.products().filter((product) => product.status === 'active'),
  );
  readonly isLoading = this.productService.isLoading;
  readonly error = this.productService.error;
  readonly isAdminLoggedIn = this.authService.isLoggedIn;
  readonly currentPhone = this.authService.currentPhone;

  readonly brands = computed<readonly string[]>(() => {
    const brandSet = new Set(this.products().map((product) => product.brand));
    return [...brandSet].sort((first, second) => first.localeCompare(second));
  });

  readonly categories = computed<readonly string[]>(() => {
    const categorySet = new Set(this.products().map((product) => product.category));
    return [...categorySet].sort((first, second) => first.localeCompare(second));
  });

  readonly featuredProducts = computed<readonly Product[]>(() =>
    this.products().filter((product) => product.featured).slice(0, 4),
  );

  readonly filteredProducts = computed<readonly Product[]>(() => {
    const normalizedSearch = this.searchTerm().trim().toLowerCase();
    const brand = this.selectedBrand();
    const category = this.selectedCategory();

    return this.products().filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(normalizedSearch);
      const matchesBrand = brand === 'all' || product.brand === brand;
      const matchesCategory = category === 'all' || product.category === category;

      return matchesSearch && matchesBrand && matchesCategory;
    });
  });

  readonly selectedImage = computed<string | null>(() => {
    const product = this.selectedProduct();

    return product?.images[this.selectedImageIndex()] ?? null;
  });

  constructor() {
    this.productService.loadProducts();
  }

  @HostListener('document:keydown.escape')
  closeLoginOnEscape(): void {
    if (this.loginModalOpen()) {
      this.closeLoginModal();
    }
  }

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  updateBrand(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedBrand.set(select.value);
  }

  updateCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  updatePhoneNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.phoneNumber.set(input.value.replace(/\D/g, '').slice(0, 11));
    this.loginError.set(null);
  }

  openLoginModal(): void {
    this.clearLoginTimer();
    this.resetLoginModal();
    this.loginModalOpen.set(true);
    this.setBodyScrollLocked(true);
  }

  closeLoginModal(): void {
    this.clearLoginTimer();
    this.loginModalOpen.set(false);
    this.setBodyScrollLocked(false);
    this.resetLoginModal();
  }

  loginWithPhone(): void {
    const phone = this.phoneNumber().trim();

    if (!/^09\d{9}$/.test(phone)) {
      this.loginError.set('شماره موبایل معتبر نیست');
      return;
    }

    const role = this.authService.loginWithPhone(phone);
    this.loginError.set(null);
    this.loginSuccessMessage.set(
      role === 'admin' ? 'خوش آمدید، ادمین!' : 'ورود موفق! خوش آمدید.',
    );

    this.loginRedirectTimer = setTimeout(() => {
      if (role === 'admin') {
        void this.router.navigate(['/admin/dashboard']);
        this.setBodyScrollLocked(false);
        return;
      }

      this.closeLoginModal();
    }, 1500);
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

  private resetLoginModal(): void {
    this.phoneNumber.set('');
    this.loginError.set(null);
    this.loginSuccessMessage.set(null);
  }

  private clearLoginTimer(): void {
    if (!this.loginRedirectTimer) {
      return;
    }

    clearTimeout(this.loginRedirectTimer);
    this.loginRedirectTimer = null;
  }

  private setBodyScrollLocked(isLocked: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = isLocked ? 'hidden' : '';
  }
}
