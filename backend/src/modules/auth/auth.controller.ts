//backend/src/modules/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
    Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './services/auth.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
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
    RefreshSchema,
    RefreshDto,
    LogoutSchema,
    LogoutDto,
} from './contracts/refresh.dto.js';
import { DeviceInfo } from '../../common/types/device-info.type.js';
import { randomBytes } from 'crypto';

const DEVICE_COOKIE = 'yam_device_id';
const DEVICE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

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

    @Post('register')
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    async register(
        @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }

    @Post('verify-email')
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    async verifyEmail(
        @Body(new ZodValidationPipe(VerifyEmailSchema)) dto: VerifyEmailDto,
    ) {
        return this.authService.verifyEmail(dto);
    }

    @Post('login')
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    async login(
        @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.login(dto, this.getDeviceInfo(req, res));
    }

    @Post('verify-login')
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    async verifyLogin(
        @Body(new ZodValidationPipe(VerifyLoginSchema)) dto: VerifyLoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.verifyLoginCode(
            dto,
            this.getDeviceInfo(req, res),
        );
    }

    @Post('refresh')
    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body(new ZodValidationPipe(RefreshSchema)) dto: RefreshDto,
    ) {
        return this.sessionsService.refresh(dto.refreshToken);
    }

    @Post('logout')
    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    async logout(
        @Body(new ZodValidationPipe(LogoutSchema)) dto: LogoutDto,
    ) {
        return this.sessionsService.revokeByToken(dto.refreshToken);
    }
}