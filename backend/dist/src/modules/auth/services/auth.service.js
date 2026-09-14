var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend\src\modules\auth\services\auth.service.ts
//backend/src/modules/auth/services/auth.service.ts
import { Injectable, UnauthorizedException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../../infra/email/email.service.js';
import { SecurityService } from './security.service.js';
import { SessionsService } from '../../sessions/sessions.service.js';
const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy';
let AuthService = class AuthService {
    prisma;
    jwt;
    email;
    security;
    sessions;
    constructor(prisma, jwt, email, security, sessions) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.email = email;
        this.security = security;
        this.sessions = sessions;
    }
    async register(dto) {
        const exists = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
        });
        if (exists) {
            // Делаем такую же дорогую работу, как при создании
            await argon2.hash(dto.password);
            if (exists.status === 'ACTIVE') {
                // Не отправляем код — просто письмо-предупреждение
                await this.email.sendAlreadyRegisteredEmail(dto.email);
            }
            else {
                // Отправляем код для неактивных
                await this.email.sendVerificationCode(exists.id, dto.email);
            }
            return {
                message: 'If this email is registered, verification code sent',
            };
        }
        const passwordHash = await argon2.hash(dto.password);
        const user = await this.prisma.client.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
            },
        });
        await this.email.sendVerificationCode(user.id, dto.email);
        const verificationToken = this.jwt.sign({ sub: user.id, purpose: 'email_verification' }, { expiresIn: '15m', issuer: 'yam-api', audience: 'yam-client' });
        return {
            message: 'Verification code sent to email',
            verificationToken,
        };
    }
    async verifyEmail(dto) {
        let userId;
        try {
            const payload = this.jwt.verify(dto.verificationToken, {
                issuer: 'yam-api',
                audience: 'yam-client',
            });
            if (payload.purpose !== 'email_verification') {
                throw new UnauthorizedException('Invalid token');
            }
            userId = payload.sub;
        }
        catch {
            throw new UnauthorizedException('Invalid token');
        }
        const verification = await this.prisma.client.emailVerification.findFirst({
            where: { userId, verifiedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (!verification)
            throw new UnauthorizedException('Invalid verification');
        if (verification.expiresAt < new Date())
            throw new UnauthorizedException('Code expired');
        if (verification.attempts >= 5)
            throw new UnauthorizedException('Too many attempts');
        const valid = await argon2.verify(verification.codeHash, dto.code);
        if (!valid) {
            await this.prisma.client.emailVerification.update({
                where: { id: verification.id },
                data: { attempts: { increment: 1 } },
            });
            throw new UnauthorizedException('Invalid code');
        }
        await this.prisma.client.emailVerification.update({
            where: { id: verification.id },
            data: { verifiedAt: new Date() },
        });
        return { success: true };
    }
    async login(dto, deviceInfo) {
        await this.security.checkBruteforce(dto.email, deviceInfo.ip);
        const user = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
        });
        const valid = user
            ? await argon2.verify(user.passwordHash, dto.password)
            : await argon2.verify(DUMMY_HASH, dto.password);
        if (!user || !valid || user.status !== 'ACTIVE') {
            await this.security.logFailedAttempt(user?.id ?? null, dto.email, deviceInfo);
            throw new UnauthorizedException('Invalid credentials');
        }
        const isNewDevice = await this.security.isNewDevice(user.id, deviceInfo);
        if (isNewDevice) {
            await this.email.sendLoginCode(user.id, dto.email);
            const verificationToken = this.jwt.sign({ sub: user.id, purpose: 'login_2fa' }, { expiresIn: '10m', issuer: 'yam-api', audience: 'yam-client' });
            return { requiresTwoFactor: true, verificationToken };
        }
        const tokens = await this.sessions.createSession(user.id, deviceInfo);
        await this.security.logSuccessfulAttempt(user.id, dto.email, deviceInfo);
        return tokens;
    }
    async verifyLoginCode(dto, deviceInfo) {
        let userId;
        try {
            const payload = this.jwt.verify(dto.verificationToken, {
                issuer: 'yam-api',
                audience: 'yam-client',
            });
            if (payload.purpose !== 'login_2fa') {
                throw new UnauthorizedException('Invalid token');
            }
            userId = payload.sub;
        }
        catch {
            throw new UnauthorizedException('Invalid token');
        }
        const valid = await this.email.verifyLoginCode(userId, dto.code);
        if (!valid)
            throw new UnauthorizedException('Invalid code');
        const tokens = await this.sessions.createSession(userId, deviceInfo);
        return tokens;
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        EmailService,
        SecurityService,
        SessionsService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map