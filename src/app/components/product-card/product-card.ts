import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  private readonly numberFormatter = new Intl.NumberFormat('fa-IR');
  private readonly priceFormatter = new Intl.NumberFormat('fa-IR');

  readonly product = input.required<Product>();
  readonly imageSelected = output<Product>();

  formatNumber(value: number): string {
    return this.numberFormatter.format(value);
  }

  formatPrice(value: number): string {
    return `${this.priceFormatter.format(value)} تومان`;
  }

  hasDiscount(): boolean {
    const product = this.product();
    return Boolean(product.discountPrice && product.discountPrice < product.price);
  }

  discountPercent(): string {
    const product = this.product();

    if (!product.discountPrice || product.discountPrice >= product.price) {
      return '';
    }

    const percent = Math.round(((product.price - product.discountPrice) / product.price) * 100);
    return `${this.formatNumber(percent)}٪`;
  }

  openAlbum(): void {
    this.imageSelected.emit(this.product());
  }
}
