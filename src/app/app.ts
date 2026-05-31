import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductsPage } from './pages/products/products';

@Component({
  selector: 'app-root',
  imports: [ProductsPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
}
