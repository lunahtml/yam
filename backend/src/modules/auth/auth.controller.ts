//backend/src/modules/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './services/auth.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { RegisterSchema, RegisterDto } from './contracts/register.dto.js';
import { LoginSchema, LoginDto } from './contracts/login.dto.js';
import { VerifyEmailSchema, VerifyEmailDto } from './contracts/verify-email.dto.js';
import { VerifyLoginSchema, VerifyLoginDto } from './contracts/verify-login.dto.js';
import { DeviceInfo } from '../../common/types/device-info.type.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionsService: SessionsService,
    ) { }

    private getDeviceInfo(req: Request): DeviceInfo {
        return {
            ip: req.ip ?? 'unknown',
            userAgent: (req.headers['user-agent'] as string) ?? 'unknown',
            deviceId: (req.headers['x-device-id'] as string) ?? 'unknown',
        };
    }

    @Post('register')
    async register(
        @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(
        @Body(new ZodValidationPipe(VerifyEmailSchema)) dto: VerifyEmailDto,
    ) {
        return this.authService.verifyEmail(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
        @Req() req: Request,
    ) {
        return this.authService.login(dto, this.getDeviceInfo(req));
    }

    @Post('verify-login')
    @HttpCode(HttpStatus.OK)
    async verifyLogin(
        @Body(new ZodValidationPipe(VerifyLoginSchema)) dto: VerifyLoginDto,
        @Req() req: Request,
    ) {
        return this.authService.verifyLoginCode(dto, this.getDeviceInfo(req));
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.sessionsService.refresh(refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body('refreshToken') refreshToken: string) {
        return this.sessionsService.revokeByToken(refreshToken);
    }
}