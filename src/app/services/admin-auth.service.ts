import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

const LEGACY_TOKEN_KEY = 'arcopal_admin_token';
const LEGACY_USER_KEY = 'arcopal_admin_user';
const KAAMO_USER_KEY = 'kaamo_user';
const KAAMO_ROLE_KEY = 'kaamo_role';

export type KaamoRole = 'admin' | 'user';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AuthResponse {
  message?: string;
  user: AdminUser;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private refreshRequest: Observable<AuthResponse> | null = null;

  readonly currentUser = signal<AdminUser | null>(null);
  readonly currentPhone = signal<string | null>(this.readPhone());
  readonly currentRole = signal<KaamoRole | null>(this.readRole());
  readonly isLoggedIn = signal<boolean>(false);

  constructor() {
    this.clearLegacyStorage();
    queueMicrotask(() => {
      this.validateSession().subscribe({ error: () => undefined });
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      })
      .pipe(tap((response) => this.setAuthenticatedUser(response.user)));
  }

  validateSession(): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`${API_BASE_URL}/auth/session`)
      .pipe(tap((response) => this.setAuthenticatedUser(response.user)));
  }

  refreshSession(): Observable<AuthResponse> {
    if (!this.refreshRequest) {
      this.refreshRequest = this.http
        .post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {})
        .pipe(
          tap((response) => this.setAuthenticatedUser(response.user)),
          finalize(() => {
            this.refreshRequest = null;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }

    return this.refreshRequest;
  }

  loginWithPhone(phone: string): KaamoRole {
    const normalizedPhone = phone.trim();
    const role: KaamoRole = 'user';

    // Phone login is a storefront preference only; admin authorization always comes from the API.
    this.persistPhoneSession(normalizedPhone, role);
    this.currentPhone.set(normalizedPhone);
    this.currentRole.set(role);

    return role;
  }

  logout(): void {
    this.clearSession();
    this.revokeServerSession();
  }

  endAdminSession(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.clearLegacyStorage();
    this.revokeServerSession();
  }

  clearSession(): void {
    this.currentUser.set(null);
    this.currentPhone.set(null);
    this.currentRole.set(null);
    this.isLoggedIn.set(false);
    this.clearLegacyStorage();

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(KAAMO_USER_KEY);
      sessionStorage.removeItem(KAAMO_ROLE_KEY);
    }
  }

  private setAuthenticatedUser(user: AdminUser): void {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  private revokeServerSession(): void {
    this.http
      .post(`${API_BASE_URL}/auth/logout`, {})
      .subscribe({ error: () => undefined });
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

    return sessionStorage.getItem(KAAMO_ROLE_KEY) === 'user' ? 'user' : null;
  }

  private persistPhoneSession(phone: string, role: KaamoRole): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.setItem(KAAMO_USER_KEY, phone);
    sessionStorage.setItem(KAAMO_ROLE_KEY, role);
  }

  private clearLegacyStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    // Remove bearer tokens written by older builds; new admin sessions live in HttpOnly cookies.
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  }
}
