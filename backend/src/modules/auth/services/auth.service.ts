//backend\src\modules\auth\services\auth.service.ts
//backend/src/modules/auth/services/auth.service.ts
import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../../infra/email/email.service.js';
import { SecurityService } from './security.service.js';
import { SessionsService } from '../../sessions/sessions.service.js';
import { randomBytes } from 'crypto';
import { RegisterDto } from '../contracts/register.dto.js';
import { LoginDto } from '../contracts/login.dto.js';
import { VerifyEmailDto } from '../contracts/verify-email.dto.js';
import { VerifyLoginDto } from '../contracts/verify-login.dto.js';
import { DeviceInfo } from '../../../common/types/device-info.type.js';

const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private email: EmailService,
        private security: SecurityService,
        private sessions: SessionsService,
    ) { }

    async register(dto: RegisterDto) {
        const exists = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
        });

        if (exists) {
            // Делаем такую же дорогую работу, как при создании
            await argon2.hash(dto.password);

            if (exists.status === 'ACTIVE') {
                // Не отправляем код — просто письмо-предупреждение
                await this.email.sendAlreadyRegisteredEmail(dto.email);
            } else {
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

        const verificationToken = this.jwt.sign(
            { sub: user.id, purpose: 'email_verification' },
            { expiresIn: '15m', issuer: 'yam-api', audience: 'yam-client' },
        );

        return {
            message: 'Verification code sent to email',
            verificationToken,
        };
    }

    async verifyEmail(dto: VerifyEmailDto) {
        let userId: string;

        try {
            const payload = this.jwt.verify(dto.verificationToken, {
                issuer: 'yam-api',
                audience: 'yam-client',
            });

            if (payload.purpose !== 'email_verification') {
                throw new UnauthorizedException('Invalid token');
            }

            userId = payload.sub;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        const verification = await this.prisma.client.emailVerification.findFirst({
            where: { userId, verifiedAt: null },
            orderBy: { createdAt: 'desc' },
        });

        if (!verification) throw new UnauthorizedException('Invalid verification');
        if (verification.expiresAt < new Date()) throw new UnauthorizedException('Code expired');
        if (verification.attempts >= 5) throw new UnauthorizedException('Too many attempts');

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

        return { success: true, userId };
    }

    async login(dto: LoginDto, deviceInfo: DeviceInfo) {
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

            const verificationToken = this.jwt.sign(
                { sub: user.id, purpose: 'login_2fa' },
                { expiresIn: '10m', issuer: 'yam-api', audience: 'yam-client' },
            );

            return { requiresTwoFactor: true, verificationToken };
        }

        const tokens = await this.sessions.createSession(user.id, deviceInfo);
        await this.security.logSuccessfulAttempt(user.id, dto.email, deviceInfo);

        return tokens;
    }

    async verifyLoginCode(dto: VerifyLoginDto, deviceInfo: DeviceInfo) {
        let userId: string;

        try {
            const payload = this.jwt.verify(dto.verificationToken, {
                issuer: 'yam-api',
                audience: 'yam-client',
            });

            if (payload.purpose !== 'login_2fa') {
                throw new UnauthorizedException('Invalid token');
            }

            userId = payload.sub;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        const valid = await this.email.verifyLoginCode(userId, dto.code);
        if (!valid) throw new UnauthorizedException('Invalid code');

        const tokens = await this.sessions.createSession(userId, deviceInfo);
        return tokens;
    }
}