import { Routes } from '@angular/router';
import { adminAuthGuard } from './guards/admin-auth.guard';
import { ProductsPage } from './pages/products/products';

export const routes: Routes = [
  {
    path: '',
    component: ProductsPage,
    title: 'کاتالوگ محصولات آرکوپال',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-details/product-details').then(
        (component) => component.ProductDetailsPage,
      ),
    title: 'جزئیات محصول',
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin-login/admin-login').then((component) => component.AdminLoginPage),
    title: 'ورود ادمین',
  },
  {
    path: 'admin/products',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-products-list/admin-products-list').then(
        (component) => component.AdminProductsListPage,
      ),
    title: 'مدیریت محصولات',
  },
  {
    path: 'admin/products/new',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-product-form/admin-product-form').then(
        (component) => component.AdminProductFormPage,
      ),
    title: 'افزودن محصول',
  },
  {
    path: 'admin/products/edit/:id',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-product-form/admin-product-form').then(
        (component) => component.AdminProductFormPage,
      ),
    title: 'ویرایش محصول',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
