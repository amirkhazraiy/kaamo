import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

const TOKEN_KEY = 'arcopal_admin_token';
const USER_KEY = 'arcopal_admin_user';
const KAAMO_USER_KEY = 'kaamo_user';
const KAAMO_ROLE_KEY = 'kaamo_role';
const ADMIN_PHONE = '09912535935';

export type KaamoRole = 'admin' | 'user';

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
  readonly currentPhone = signal<string | null>(this.readPhone());
  readonly currentRole = signal<KaamoRole | null>(this.readRole());
  readonly isLoggedIn = signal<boolean>(this.readToken() !== null || this.readRole() === 'admin');

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

  loginWithPhone(phone: string): KaamoRole {
    const normalizedPhone = phone.trim();
    const role: KaamoRole = normalizedPhone === ADMIN_PHONE ? 'admin' : 'user';

    this.persistPhoneSession(normalizedPhone, role);
    this.currentPhone.set(normalizedPhone);
    this.currentRole.set(role);
    this.isLoggedIn.set(role === 'admin' || this.readToken() !== null);

    return role;
  }

  logout(): void {
    this.currentUser.set(null);
    this.currentPhone.set(null);
    this.currentRole.set(null);
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

  private readPhone(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(KAAMO_USER_KEY);
  }

  private readRole(): KaamoRole | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    const role = sessionStorage.getItem(KAAMO_ROLE_KEY);

    return role === 'admin' || role === 'user' ? role : null;
  }

  private persistPhoneSession(phone: string, role: KaamoRole): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.setItem(KAAMO_USER_KEY, phone);
    sessionStorage.setItem(KAAMO_ROLE_KEY, role);
  }

  private clearSession(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(KAAMO_USER_KEY);
      sessionStorage.removeItem(KAAMO_ROLE_KEY);
    }
  }
}
