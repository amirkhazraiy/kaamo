import { Injectable, signal } from '@angular/core';

const AUTH_KEY = 'arcopal_admin_auth';
const ADMIN_PASSWORD = 'admin123';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  readonly isLoggedIn = signal<boolean>(this.readAuthState());

  login(password: string): boolean {
    const isValidPassword = password === ADMIN_PASSWORD;

    if (isValidPassword) {
      this.isLoggedIn.set(true);
      this.persistAuthState(true);
    }

    return isValidPassword;
  }

  logout(): void {
    this.isLoggedIn.set(false);
    this.persistAuthState(false);
  }

  private readAuthState(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem(AUTH_KEY) === 'true';
  }

  private persistAuthState(isLoggedIn: boolean): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (isLoggedIn) {
      localStorage.setItem(AUTH_KEY, 'true');
      return;
    }

    localStorage.removeItem(AUTH_KEY);
  }
}
