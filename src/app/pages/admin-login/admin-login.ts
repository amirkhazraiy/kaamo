import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  readonly password = signal<string>('');
  readonly error = signal<string | null>(null);

  updatePassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

  login(): void {
    const isLoggedIn = this.authService.login(this.password());

    if (!isLoggedIn) {
      this.error.set('رمز عبور اشتباه است.');
      return;
    }

    void this.router.navigate(['/admin/products']);
  }
}
