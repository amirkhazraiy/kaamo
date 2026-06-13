import { createHash, randomBytes } from 'crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { IsNull, LessThan, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshSession } from './refresh-session.entity';

const DUMMY_PASSWORD_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.6OD6Hq0zK0zW4c6gM0Q1nAqKk7P1M9S';

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenTtlMs: number;
  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly config: ConfigService,
    @InjectRepository(RefreshSession)
    private readonly refreshSessions: Repository<RefreshSession>,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(loginDto.email);
    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !user.isActive || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.createSession(user);
  }

  async refresh(refreshToken: string | null): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Authentication required.');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const session = await this.refreshSessions.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
      },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Authentication required.');
    }

    const user = await this.usersService.findById(session.userId);

    if (!user || !user.isActive) {
      await this.revokeSession(session);
      throw new UnauthorizedException('Authentication required.');
    }

    const nextRefreshToken = this.generateRefreshToken();
    const nextRefreshTokenHash = this.hashRefreshToken(nextRefreshToken);
    const revoked = await this.refreshSessions.update(
      { id: session.id, revokedAt: IsNull() },
      {
        revokedAt: new Date(),
        replacedByTokenHash: nextRefreshTokenHash,
      },
    );

    // Only one request may rotate a refresh token; concurrent reuse is rejected.
    if (revoked.affected !== 1) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.createSession(user, nextRefreshToken, nextRefreshTokenHash);
  }

  async logout(refreshToken: string | null): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.refreshSessions.update(
      {
        tokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: IsNull(),
      },
      { revokedAt: new Date() },
    );
  }

  private async createSession(
    user: User,
    refreshToken = this.generateRefreshToken(),
    refreshTokenHash = this.hashRefreshToken(refreshToken),
  ): Promise<AuthResult> {
    const refreshTokenTtlMs = this.getRefreshTokenTtlMs();
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    await this.refreshSessions.delete({
      expiresAt: LessThan(new Date()),
    });
    await this.refreshSessions.save({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + refreshTokenTtlMs),
      revokedAt: null,
      replacedByTokenHash: null,
    });

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken,
      refreshTokenTtlMs,
      user: this.toAuthenticatedUser(user),
    };
  }

  private async revokeSession(session: RefreshSession): Promise<void> {
    if (!session.revokedAt) {
      await this.refreshSessions.update(session.id, { revokedAt: new Date() });
    }
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  private generateRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private getRefreshTokenTtlMs(): number {
    const days = Number(this.config.get<string>('REFRESH_TOKEN_TTL_DAYS') ?? 7);

    if (!Number.isFinite(days) || days <= 0) {
      throw new Error('REFRESH_TOKEN_TTL_DAYS must be a positive number.');
    }

    return days * 24 * 60 * 60 * 1000;
  }
}
