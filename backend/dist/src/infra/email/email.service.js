var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend\src\infra\email\email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as argon2 from 'argon2';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
let EmailService = class EmailService {
    prisma;
    transporter;
    constructor(prisma) {
        this.prisma = prisma;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mailhog',
            port: Number(process.env.SMTP_PORT) || 1025,
            secure: false,
            auth: undefined,
        });
    }
    generateCode() {
        return randomInt(100000, 1000000).toString();
    }
    async sendVerificationCode(userId, email) {
        const code = this.generateCode();
        const codeHash = await argon2.hash(code);
        await this.prisma.client.emailVerification.create({
            data: {
                userId,
                codeHash,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        await this.transporter.sendMail({
            from: 'YAM <no-reply@yam.local>',
            to: email,
            subject: 'YAM — подтверждение email',
            html: `<h1>Ваш код: ${code}</h1>`,
        });
    }
    async sendLoginCode(userId, email) {
        const code = this.generateCode();
        const codeHash = await argon2.hash(code);
        await this.prisma.client.emailVerification.create({
            data: {
                userId,
                codeHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        await this.transporter.sendMail({
            from: 'YAM <no-reply@yam.local>',
            to: email,
            subject: 'YAM — новый вход в аккаунт',
            html: `<h1>Это вы входите? Код: ${code}</h1>`,
        });
    }
    async verifyLoginCode(userId, code) {
        const verification = await this.prisma.client.emailVerification.findFirst({
            where: { userId, verifiedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (!verification || verification.expiresAt < new Date())
            return false;
        if (verification.attempts >= 5)
            return false;
        const valid = await argon2.verify(verification.codeHash, code);
        if (!valid) {
            await this.prisma.client.emailVerification.update({
                where: { id: verification.id },
                data: { attempts: { increment: 1 } },
            });
            return false;
        }
        await this.prisma.client.emailVerification.update({
            where: { id: verification.id },
            data: { verifiedAt: new Date() },
        });
        return true;
    }
    async sendAlreadyRegisteredEmail(email) {
        await this.transporter.sendMail({
            from: 'YAM <no-reply@yam.local>',
            to: email,
            subject: 'YAM — попытка регистрации',
            html: '<h1>Кто-то пытался зарегистрироваться с вашим email. Если это не вы — проигнорируйте.</h1>',
        });
    }
};
EmailService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], EmailService);
export { EmailService };
//# sourceMappingURL=email.service.js.map