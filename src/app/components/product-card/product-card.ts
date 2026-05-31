import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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

  readonly product = input.required<Product>();

  formatNumber(value: number): string {
    return this.numberFormatter.format(value);
  }
}
