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
//backend/src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException, } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './services/auth.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { RegisterSchema } from './contracts/register.dto.js';
import { LoginSchema } from './contracts/login.dto.js';
import { VerifyEmailSchema, } from './contracts/verify-email.dto.js';
import { VerifyLoginSchema, } from './contracts/verify-login.dto.js';
import { DenyLoginSchema, } from './contracts/deny-login.dto.js';
import { randomBytes } from 'crypto';
const DEVICE_COOKIE = 'yam_device_id';
const DEVICE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;
const ACCESS_COOKIE = 'yam_access_token';
const REFRESH_COOKIE = 'yam_refresh_token';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
let AuthController = class AuthController {
    authService;
    sessionsService;
    constructor(authService, sessionsService) {
        this.authService = authService;
        this.sessionsService = sessionsService;
    }
    getDeviceInfo(req, res) {
        let deviceId = req.cookies?.[DEVICE_COOKIE];
        if (!deviceId) {
            deviceId = randomBytes(32).toString('hex');
            res.cookie(DEVICE_COOKIE, deviceId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: DEVICE_COOKIE_MAX_AGE,
                path: '/',
            });
        }
        return {
            ip: req.ip ?? 'unknown',
            userAgent: req.headers['user-agent'] ?? 'unknown',
            deviceId,
        };
    }
    setAuthCookies(res, accessToken, refreshToken) {
        const cookieOpts = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        };
        res.cookie(ACCESS_COOKIE, accessToken, {
            ...cookieOpts,
            maxAge: ACCESS_COOKIE_MAX_AGE,
        });
        res.cookie(REFRESH_COOKIE, refreshToken, {
            ...cookieOpts,
            maxAge: REFRESH_COOKIE_MAX_AGE,
        });
    }
    clearAuthCookies(res) {
        res.clearCookie(ACCESS_COOKIE, { path: '/' });
        res.clearCookie(REFRESH_COOKIE, { path: '/' });
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async verifyEmail(dto, req, res) {
        const result = await this.authService.verifyEmail(dto);
        const deviceInfo = this.getDeviceInfo(req, res);
        const tokens = await this.sessionsService.createSession(result.userId, deviceInfo);
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }
    async login(dto, req, res) {
        const result = await this.authService.login(dto, this.getDeviceInfo(req, res));
        if ('accessToken' in result) {
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            return { requiresTwoFactor: false };
        }
        return result;
    }
    async verifyLogin(dto, req, res) {
        const tokens = await this.authService.verifyLoginCode(dto, this.getDeviceInfo(req, res));
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }
    async denyLogin(dto) {
        return this.authService.denyLogin(dto);
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }
        const tokens = await this.sessionsService.refresh(refreshToken);
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (refreshToken) {
            await this.sessionsService.revokeByToken(refreshToken);
        }
        this.clearAuthCookies(res);
        return { success: true };
    }
};
__decorate([
    Public(),
    Throttle({ auth: { limit: 5, ttl: 60000 } }),
    Post('register'),
    __param(0, Body(new ZodValidationPipe(RegisterSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Public(),
    Throttle({ auth: { limit: 5, ttl: 60000 } }),
    Post('verify-email'),
    HttpCode(HttpStatus.OK),
    __param(0, Body(new ZodValidationPipe(VerifyEmailSchema))),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    Public(),
    Throttle({ auth: { limit: 5, ttl: 60000 } }),
    Post('login'),
    HttpCode(HttpStatus.OK),
    __param(0, Body(new ZodValidationPipe(LoginSchema))),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Public(),
    Throttle({ auth: { limit: 5, ttl: 60000 } }),
    Post('verify-login'),
    HttpCode(HttpStatus.OK),
    __param(0, Body(new ZodValidationPipe(VerifyLoginSchema))),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyLogin", null);
__decorate([
    Public(),
    Throttle({ auth: { limit: 5, ttl: 60000 } }),
    Post('deny-login'),
    HttpCode(HttpStatus.OK),
    __param(0, Body(new ZodValidationPipe(DenyLoginSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "denyLogin", null);
__decorate([
    Public(),
    Throttle({ auth: { limit: 10, ttl: 60000 } }),
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    __param(0, Req()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    Public(),
    Throttle({ auth: { limit: 10, ttl: 60000 } }),
    Post('logout'),
    HttpCode(HttpStatus.OK),
    __param(0, Req()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
AuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService,
        SessionsService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map