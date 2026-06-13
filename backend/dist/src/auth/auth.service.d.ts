import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshSession } from './refresh-session.entity';
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
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    private readonly refreshSessions;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService, refreshSessions: Repository<RefreshSession>);
    login(loginDto: LoginDto): Promise<AuthResult>;
    refresh(refreshToken: string | null): Promise<AuthResult>;
    logout(refreshToken: string | null): Promise<void>;
    private createSession;
    private revokeSession;
    private toAuthenticatedUser;
    private generateRefreshToken;
    private hashRefreshToken;
    private getRefreshTokenTtlMs;
}
export {};
