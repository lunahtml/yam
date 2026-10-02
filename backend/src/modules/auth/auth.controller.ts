//backend/src/modules/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
    Res,
    UnauthorizedException,
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
import {
    DenyLoginSchema,
    DenyLoginDto,
} from './contracts/deny-login.dto.js';
import { DeviceInfo } from '../../common/types/device-info.type.js';
import { randomBytes } from 'crypto';

const DEVICE_COOKIE = 'yam_device_id';
const DEVICE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

const ACCESS_COOKIE = 'yam_access_token';
const REFRESH_COOKIE = 'yam_refresh_token';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

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

    private setAuthCookies(
        res: Response,
        accessToken: string,
        refreshToken: string,
    ) {
        const cookieOpts = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
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
        const result = await this.authService.login(
            dto,
            this.getDeviceInfo(req, res),
        );

        if ('accessToken' in result) {
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            return { requiresTwoFactor: false };
        }

        return result;
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
        const tokens = await this.authService.verifyLoginCode(
            dto,
            this.getDeviceInfo(req, res),
        );
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }

    @Public()
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('deny-login')
    @HttpCode(HttpStatus.OK)
    async denyLogin(
        @Body(new ZodValidationPipe(DenyLoginSchema)) dto: DenyLoginDto,
    ) {
        return this.authService.denyLogin(dto);
    }

    @Public()
    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }

        const tokens = await this.sessionsService.refresh(refreshToken);

        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { success: true };
    }

    @Public()
    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];

        if (refreshToken) {
            await this.sessionsService.revokeByToken(refreshToken);
        }

        this.clearAuthCookies(res);
        return { success: true };
    }
}