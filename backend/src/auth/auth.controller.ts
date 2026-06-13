import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  clearAuthCookies,
  readCookie,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
} from './auth-cookies';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginAttemptsService } from './login-attempts.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(LoginAttemptsService)
    private readonly loginAttempts: LoginAttemptsService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and establish a secure cookie session' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ipAddress = request.ip || request.socket.remoteAddress || 'unknown';
    this.loginAttempts.assertAllowed(ipAddress);

    try {
      const result = await this.authService.login(loginDto);
      this.loginAttempts.recordSuccess(ipAddress);
      this.writeSessionCookies(response, result);

      return {
        message: 'Login successful.',
        user: result.user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.loginAttempts.recordFailure(ipAddress);
      }
      throw error;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate the refresh token and renew the session' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refresh(readCookie(request, REFRESH_COOKIE_NAME));
    this.writeSessionCookies(response, result);

    return { user: result.user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke the current refresh token and clear the session' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(readCookie(request, REFRESH_COOKIE_NAME));
    clearAuthCookies(response, this.isProduction());

    return { message: 'Logout successful.' };
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate the access token and return the current user' })
  session(@Req() request: AuthenticatedRequest) {
    return { user: request.user };
  }

  private writeSessionCookies(
    response: Response,
    result: Awaited<ReturnType<AuthService['login']>>,
  ): void {
    setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
      result.refreshTokenTtlMs,
      this.isProduction(),
    );
  }

  private isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }
}
