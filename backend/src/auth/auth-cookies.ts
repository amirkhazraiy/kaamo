import { CookieOptions, Request, Response } from 'express';

export const ACCESS_COOKIE_NAME = 'arcopal_access';
export const REFRESH_COOKIE_NAME = 'arcopal_refresh';

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

export function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');

    if (separator === -1 || part.slice(0, separator).trim() !== name) {
      continue;
    }

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
  refreshTokenTtlMs: number,
  isProduction: boolean,
): void {
  response.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...baseCookieOptions(isProduction),
    maxAge: ACCESS_TOKEN_TTL_MS,
    path: '/api',
  });
  response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...baseCookieOptions(isProduction),
    maxAge: refreshTokenTtlMs,
    path: '/api/auth',
  });
}

export function clearAuthCookies(response: Response, isProduction: boolean): void {
  response.clearCookie(ACCESS_COOKIE_NAME, {
    ...baseCookieOptions(isProduction),
    path: '/api',
  });
  response.clearCookie(REFRESH_COOKIE_NAME, {
    ...baseCookieOptions(isProduction),
    path: '/api/auth',
  });
}

function baseCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  };
}
