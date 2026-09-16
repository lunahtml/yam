var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
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
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map