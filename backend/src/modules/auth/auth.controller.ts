//backend/src/modules/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
    Res,
    UnauthorizedException, // ДОБАВЛЕНО: нужен для случая, когда refresh-cookie отсутствует
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './services/auth.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { RegisterSchema, RegisterDto } from './contracts/register.dto.js';
import { LoginSchema, LoginDto } from './contracts/login.dto.js';
import {
    VerifyEmailSchema,
    VerifyEmailDto,
} from './contracts/verify-email.dto.js';
import {
    VerifyLoginSchema,
    VerifyLoginDto,
} from './contracts/verify-login.dto.js';
// УБРАНО: import { RefreshSchema, RefreshDto, LogoutSchema, LogoutDto } from './contracts/refresh.dto.js';
// ПОЧЕМУ: refresh/logout больше не принимают refreshToken в теле запроса — он читается
// из httpOnly cookie, поэтому эти DTO/схемы здесь больше не нужны.
// Сам файл refresh.dto.ts можно оставить нетронутым — на случай, если он ещё используется
// где-то ещё, либо удалить, если нигде больше не импортируется.
import { DeviceInfo } from '../../common/types/device-info.type.js';
import { randomBytes } from 'crypto';

const DEVICE_COOKIE = 'yam_device_id';
const DEVICE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

// ДОБАВЛЕНО: константы для новых cookie с токенами
const ACCESS_COOKIE = 'yam_access_token';
const REFRESH_COOKIE = 'yam_refresh_token';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // синхронизировать с JWT_EXPIRES_IN
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // синхронизировать с TTL в sessions.service.ts

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionsService: SessionsService,
    ) { }

    private getDeviceInfo(req: Request, res: Response): DeviceInfo {
        let deviceId = req.cookies?.[DEVICE_COOKIE] as string | undefined;

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
            userAgent: (req.headers['user-agent'] as string) ?? 'unknown',
            deviceId,
        };
    }

    // ДОБАВЛЕНО: общий helper для установки обеих auth-cookie одновременно.
    // ПОЧЕМУ: раньше accessToken/refreshToken возвращались в теле JSON-ответа,
    // и фронтенд сам клал их в localStorage — открытая дверь для XSS-кражи токенов.
    // Теперь бэкенд сам кладёт их в httpOnly cookie, фронтенд их вообще не видит.
    private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        const cookieOpts = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
        };

        res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOpts, maxAge: ACCESS_COOKIE_MAX_AGE });
        res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOpts, maxAge: REFRESH_COOKIE_MAX_AGE });
    }

    // ДОБАВЛЕНО: helper для logout — снимает обе cookie.
    private clearAuthCookies(res: Response) {
        res.clearCookie(ACCESS_COOKIE, { path: '/' });
        res.clearCookie(REFRESH_COOKIE, { path: '/' });
    }

    @Public()
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('register')
    async register(
        @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }

    @Public()
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(
        @Body(new ZodValidationPipe(VerifyEmailSchema)) dto: VerifyEmailDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.verifyEmail(dto);

        const deviceInfo = this.getDeviceInfo(req, res);
        const tokens = await this.sessionsService.createSession(
            result.userId,
            deviceInfo,
        );

        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        return { success: true };
    }

    @Public()
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
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

    @Public()
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('verify-login')
    @HttpCode(HttpStatus.OK)
    async verifyLogin(
        @Body(new ZodValidationPipe(VerifyLoginSchema)) dto: VerifyLoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // БЫЛО: return this.authService.verifyLoginCode(dto, this.getDeviceInfo(req, res));
        // ПОЧЕМУ ИЗМЕНЕНО: та же логика, что и в login() — токены теперь идут в cookie,
        // а не в тело ответа.
        const tokens = await this.authService.verifyLoginCode(dto, this.getDeviceInfo(req, res));
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }

    @Public()
    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        // УБРАНО: @Body(new ZodValidationPipe(RefreshSchema)) dto: RefreshDto,
        // ПОЧЕМУ: refreshToken больше не приходит в теле запроса — фронтенд его вообще
        // не видит и не может передать явно. Токен теперь читается из httpOnly cookie.
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
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

    @Public()
    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        // УБРАНО: @Body(new ZodValidationPipe(LogoutSchema)) dto: LogoutDto,
        // ПОЧЕМУ: тот же принцип — refreshToken больше не передаётся явно клиентом.
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];

        // ДОБАВЛЕНО: если cookie почему-то уже нет — не падаем с ошибкой,
        // просто всё равно чистим cookie на стороне браузера (idempotent logout)
        if (refreshToken) {
            await this.sessionsService.revokeByToken(refreshToken);
        }

        this.clearAuthCookies(res); // ДОБАВЛЕНО: снимаем обе cookie при выходе
        return { success: true };
    }
}