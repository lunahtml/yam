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
import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException, // ДОБАВЛЕНО: нужен для случая, когда refresh-cookie отсутствует
 } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './services/auth.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { RegisterSchema } from './contracts/register.dto.js';
import { LoginSchema } from './contracts/login.dto.js';
import { VerifyEmailSchema, } from './contracts/verify-email.dto.js';
import { VerifyLoginSchema, } from './contracts/verify-login.dto.js';
import { randomBytes } from 'crypto';
const DEVICE_COOKIE = 'yam_device_id';
const DEVICE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;
// ДОБАВЛЕНО: константы для новых cookie с токенами
const ACCESS_COOKIE = 'yam_access_token';
const REFRESH_COOKIE = 'yam_refresh_token';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // синхронизировать с JWT_EXPIRES_IN
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // синхронизировать с TTL в sessions.service.ts
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
    // ДОБАВЛЕНО: общий helper для установки обеих auth-cookie одновременно.
    // ПОЧЕМУ: раньше accessToken/refreshToken возвращались в теле JSON-ответа,
    // и фронтенд сам клал их в localStorage — открытая дверь для XSS-кражи токенов.
    // Теперь бэкенд сам кладёт их в httpOnly cookie, фронтенд их вообще не видит.
    setAuthCookies(res, accessToken, refreshToken) {
        const cookieOpts = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        };
        res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOpts, maxAge: ACCESS_COOKIE_MAX_AGE });
        res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOpts, maxAge: REFRESH_COOKIE_MAX_AGE });
    }
    // ДОБАВЛЕНО: helper для logout — снимает обе cookie.
    clearAuthCookies(res) {
        res.clearCookie(ACCESS_COOKIE, { path: '/' });
        res.clearCookie(REFRESH_COOKIE, { path: '/' });
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async verifyEmail(dto) {
        return this.authService.verifyEmail(dto);
    }
    async login(dto, req, res) {
        // БЫЛО: return this.authService.login(dto, this.getDeviceInfo(req, res));
        // ПОЧЕМУ ИЗМЕНЕНО: authService.login() возвращает либо {accessToken, refreshToken},
        // либо {requiresTwoFactor: true, verificationToken} (если устройство новое).
        // Раньше оба варианта уходили в теле ответа как есть. Теперь, если пришли токены —
        // кладём их в cookie и НЕ отдаём в теле ответа (фронтенд их не должен видеть).
        // Если пришёл запрос на 2FA — тело ответа не меняется, verificationToken по-прежнему
        // нужен фронтенду, чтобы отправить его вместе с кодом на /verify-login.
        const result = await this.authService.login(dto, this.getDeviceInfo(req, res));
        if ('accessToken' in result) {
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            return { requiresTwoFactor: false };
        }
        return result; // { requiresTwoFactor: true, verificationToken }
    }
    async verifyLogin(dto, req, res) {
        // БЫЛО: return this.authService.verifyLoginCode(dto, this.getDeviceInfo(req, res));
        // ПОЧЕМУ ИЗМЕНЕНО: та же логика, что и в login() — токены теперь идут в cookie,
        // а не в тело ответа.
        const tokens = await this.authService.verifyLoginCode(dto, this.getDeviceInfo(req, res));
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }
    async refresh(req, res) {
        // ДОБАВЛЕНО: чтение refreshToken из cookie вместо dto.refreshToken
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }
        const tokens = await this.sessionsService.refresh(refreshToken);
        // ДОБАВЛЕНО: новая пара токенов (rotation) снова кладётся в cookie,
        // а не возвращается в теле ответа
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        // ДОБАВЛЕНО: если cookie почему-то уже нет — не падаем с ошибкой,
        // просто всё равно чистим cookie на стороне браузера (idempotent logout)
        if (refreshToken) {
            await this.sessionsService.revokeByToken(refreshToken);
        }
        this.clearAuthCookies(res); // ДОБАВЛЕНО: снимаем обе cookie при выходе
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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