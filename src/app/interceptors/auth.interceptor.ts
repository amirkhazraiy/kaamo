import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AdminAuthService } from '../services/admin-auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);
  const isApiRequest = request.url.startsWith(API_BASE_URL);

  if (!isApiRequest) {
    return next(request);
  }

  const cookieRequest = request.clone({ withCredentials: true });
  const isLoginRequest = request.url.endsWith('/auth/login');
  const isRefreshRequest = request.url.endsWith('/auth/refresh');
  const isLogoutRequest = request.url.endsWith('/auth/logout');

  return next(cookieRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 403) {
        endSession(authService, router);
        return throwError(() => error);
      }

      if (
        error.status !== 401 ||
        isLoginRequest ||
        isRefreshRequest ||
        isLogoutRequest
      ) {
        return throwError(() => error);
      }

      return authService.refreshSession().pipe(
        switchMap(() => next(cookieRequest)),
        catchError((refreshError: unknown) => {
          endSession(authService, router);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function endSession(authService: AdminAuthService, router: Router): void {
  authService.endAdminSession();

  if (!router.url.startsWith('/admin/login')) {
    void router.navigate(['/admin/login']);
  }
}
