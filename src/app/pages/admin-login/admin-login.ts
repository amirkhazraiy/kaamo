import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginPage {
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly email = signal<string>('admin@example.com');
  readonly password = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  updateEmail(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  updatePassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

  login(): void {
    this.error.set(null);

    if (!this.email().trim() || !this.password()) {
      this.error.set('Email and password are required.');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .login(this.email(), this.password())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.error.set(error?.error?.message ?? 'Login failed. Please try again.');
        },
      });
  }
}
