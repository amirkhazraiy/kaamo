import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

const TOKEN_KEY = 'arcopal_admin_token';
const USER_KEY = 'arcopal_admin_user';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: AdminUser;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<AdminUser | null>(this.readUser());
  readonly isLoggedIn = signal<boolean>(this.readToken() !== null);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      })
      .pipe(
        tap((response) => {
          this.persistSession(response.token, response.user);
          this.currentUser.set(response.user);
          this.isLoggedIn.set(true);
        }),
      );
  }

  getToken(): string | null {
    return this.readToken();
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.clearSession();
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AdminUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AdminUser;
    } catch {
      return null;
    }
  }

  private persistSession(token: string, user: AdminUser): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
