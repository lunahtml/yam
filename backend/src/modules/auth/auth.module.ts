//backend\src\modules\auth\auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { SecurityService } from './services/security.service.js';
import { EmailService } from '../../infra/email/email.service.js';
import { SessionsModule } from '../sessions/sessions.module.js';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '15m' },
        }),
        SessionsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, SecurityService, EmailService],
    exports: [AuthService],
})
export class AuthModule { }