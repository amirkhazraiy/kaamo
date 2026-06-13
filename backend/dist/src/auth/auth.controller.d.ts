import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginAttemptsService } from './login-attempts.service';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
        name: string | null;
        role: string;
    };
}
export declare class AuthController {
    private readonly authService;
    private readonly loginAttempts;
    private readonly config;
    constructor(authService: AuthService, loginAttempts: LoginAttemptsService, config: ConfigService);
    login(loginDto: LoginDto, request: Request, response: Response): Promise<{
        message: string;
        user: import("./auth.service").AuthenticatedUser;
    }>;
    refresh(request: Request, response: Response): Promise<{
        user: import("./auth.service").AuthenticatedUser;
    }>;
    logout(request: Request, response: Response): Promise<{
        message: string;
    }>;
    session(request: AuthenticatedRequest): {
        user: {
            id: number;
            email: string;
            name: string | null;
            role: string;
        };
    };
    private writeSessionCookies;
    private isProduction;
}
export {};
