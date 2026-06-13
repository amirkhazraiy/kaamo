import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface LoginAttempt {
  windowStartedAt: number;
  failures: number;
  blockedUntil: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_BACKOFF_MS = 60 * 1000;

@Injectable()
export class LoginAttemptsService {
  private readonly attempts = new Map<string, LoginAttempt>();

  assertAllowed(ipAddress: string): void {
    const now = Date.now();
    const attempt = this.getCurrentAttempt(ipAddress, now);

    if (!attempt) {
      return;
    }

    if (attempt.failures >= MAX_FAILURES || attempt.blockedUntil > now) {
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(ipAddress: string): void {
    const now = Date.now();
    const attempt = this.getCurrentAttempt(ipAddress, now) ?? {
      windowStartedAt: now,
      failures: 0,
      blockedUntil: now,
    };

    attempt.failures += 1;

    // Slow repeated guessing while preserving a hard five-attempt limit per window.
    const backoffMs = Math.min(2 ** (attempt.failures - 1) * 1000, MAX_BACKOFF_MS);
    attempt.blockedUntil =
      attempt.failures >= MAX_FAILURES
        ? attempt.windowStartedAt + WINDOW_MS
        : now + backoffMs;

    this.attempts.set(ipAddress, attempt);
  }

  recordSuccess(ipAddress: string): void {
    this.attempts.delete(ipAddress);
  }

  private getCurrentAttempt(ipAddress: string, now: number): LoginAttempt | null {
    const attempt = this.attempts.get(ipAddress);

    if (!attempt) {
      return null;
    }

    if (now - attempt.windowStartedAt >= WINDOW_MS) {
      this.attempts.delete(ipAddress);
      return null;
    }

    return attempt;
  }
}
