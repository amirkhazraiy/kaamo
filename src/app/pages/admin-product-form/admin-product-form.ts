import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductDraft, ProductService } from '../../services/product.service';
import { createProductSlug } from '../../utils/product-slug';

@Component({
  selector: 'app-admin-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductFormPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private patchedProductId: number | null = null;

  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly productId = Number(this.route.snapshot.paramMap.get('id')) || null;
  readonly isEditing = this.productId !== null;
  readonly products = this.productService.products;
  readonly isLoading = this.productService.isLoading;

  readonly product = computed(() =>
    this.productId ? this.productService.findProductById(this.productId) : null,
  );

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    category: ['سرویس غذاخوری', [Validators.required]],
    brand: ['آرکوپال', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    discountPrice: this.formBuilder.control<number | null>(null, [Validators.min(0)]),
    stock: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [5, [Validators.required, Validators.min(0)]],
    persons: [6, [Validators.required, Validators.min(1)]],
    pieces: [1, [Validators.required, Validators.min(1)]],
    shortDescription: ['', [Validators.maxLength(200)]],
    fullDescription: [''],
    imagesText: ['', [Validators.required]],
    status: ['active', [Validators.required]],
    featured: [false],
  });

  suggestedSlug(): string {
    const product = {
      brand: this.form.controls.brand.value,
      name: this.form.controls.name.value,
    };

    return createProductSlug(product);
  }

  constructor() {
    this.productService.loadProducts();

    effect(() => {
      const product = this.product();

      if (!product || this.patchedProductId === product.id) {
        return;
      }

      this.patchedProductId = product.id;
      this.form.patchValue({
        name: product.name,
        sku: product.sku,
        category: product.category,
        brand: product.brand,
        price: product.price,
        discountPrice: product.discountPrice ?? null,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        persons: product.persons,
        pieces: product.pieces,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        imagesText: product.images.join('\n'),
        status: product.status,
        featured: product.featured,
      });
    });
  }

  save(): void {
    this.error.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error.set('لطفا فیلدهای ضروری را کامل کنید.');
      return;
    }

    const formValue = this.form.getRawValue();
    const ignoredProductId = this.productId ?? undefined;

    if (this.productService.isSkuTaken(formValue.sku, ignoredProductId)) {
      this.error.set('این SKU قبلا برای محصول دیگری ثبت شده است.');
      return;
    }

    if (formValue.discountPrice !== null && formValue.discountPrice >= formValue.price) {
      this.error.set('قیمت تخفیف باید کمتر از قیمت اصلی باشد.');
      return;
    }

    const images = formValue.imagesText
      .split('\n')
      .map((image) => image.trim())
      .filter(Boolean);

    if (images.length === 0) {
      this.error.set('حداقل یک تصویر وارد کنید.');
      return;
    }

    const productDraft: ProductDraft = {
      image: images[0],
      images,
      slug: this.suggestedSlug(),
      sku: formValue.sku.trim(),
      brand: formValue.brand.trim(),
      name: formValue.name.trim(),
      category: formValue.category.trim(),
      price: formValue.price,
      discountPrice: formValue.discountPrice,
      stock: formValue.stock,
      lowStockThreshold: formValue.lowStockThreshold,
      persons: formValue.persons,
      pieces: formValue.pieces,
      shortDescription: formValue.shortDescription.trim(),
      fullDescription: formValue.fullDescription.trim(),
      status: formValue.status as ProductDraft['status'],
      featured: formValue.featured,
    };

    this.saving.set(true);

    if (this.productId) {
      this.productService.updateProduct(this.productId, productDraft);
    } else {
      this.productService.createProduct(productDraft);
    }

    this.saving.set(false);
    void this.router.navigate(['/admin/products']);
  }
}
