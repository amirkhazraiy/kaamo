"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const auth_cookies_1 = require("./auth-cookies");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const login_attempts_service_1 = require("./login-attempts.service");
let AuthController = class AuthController {
    constructor(authService, loginAttempts, config) {
        this.authService = authService;
        this.loginAttempts = loginAttempts;
        this.config = config;
    }
    async login(loginDto, request, response) {
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
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                this.loginAttempts.recordFailure(ipAddress);
            }
            throw error;
        }
    }
    async refresh(request, response) {
        const result = await this.authService.refresh((0, auth_cookies_1.readCookie)(request, auth_cookies_1.REFRESH_COOKIE_NAME));
        this.writeSessionCookies(response, result);
        return { user: result.user };
    }
    async logout(request, response) {
        await this.authService.logout((0, auth_cookies_1.readCookie)(request, auth_cookies_1.REFRESH_COOKIE_NAME));
        (0, auth_cookies_1.clearAuthCookies)(response, this.isProduction());
        return { message: 'Logout successful.' };
    }
    session(request) {
        return { user: request.user };
    }
    writeSessionCookies(response, result) {
        (0, auth_cookies_1.setAuthCookies)(response, result.accessToken, result.refreshToken, result.refreshTokenTtlMs, this.isProduction());
    }
    isProduction() {
        return this.config.get('NODE_ENV') === 'production';
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login and establish a secure cookie session' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate the refresh token and renew the session' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke the current refresh token and clear the session' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Validate the access token and return the current user' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "session", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)(auth_service_1.AuthService)),
    __param(1, (0, common_1.Inject)(login_attempts_service_1.LoginAttemptsService)),
    __param(2, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        login_attempts_service_1.LoginAttemptsService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map