//backend/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { SecurityService } from './services/security.service.js';
import { EmailService } from '../../infra/email/email.service.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
        }),
        SessionsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, SecurityService, EmailService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }