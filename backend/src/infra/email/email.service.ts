//backend\src\infra\email\email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as argon2 from 'argon2';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private prisma: PrismaService) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mailhog',
            port: Number(process.env.SMTP_PORT) || 1025,
            secure: false,
            auth: undefined,
        } as nodemailer.TransportOptions);
    }

    private generateCode(): string {
        return randomInt(100000, 1000000).toString();
    }

    async sendVerificationCode(userId: string, email: string) {
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

    async sendLoginCode(userId: string, email: string) {
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

    async verifyLoginCode(userId: string, code: string): Promise<boolean> {
        const verification = await this.prisma.client.emailVerification.findFirst({
            where: { userId, verifiedAt: null },
            orderBy: { createdAt: 'desc' },
        });

        if (!verification || verification.expiresAt < new Date()) return false;
        if (verification.attempts >= 5) return false;

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
    async sendAlreadyRegisteredEmail(email: string) {
        await this.transporter.sendMail({
            from: 'YAM <no-reply@yam.local>',
            to: email,
            subject: 'YAM — попытка регистрации',
            html: '<h1>Кто-то пытался зарегистрироваться с вашим email. Если это не вы — проигнорируйте.</h1>',
        });
    }

    async sendProjectInvitation(
        email: string,
        projectName: string,
        inviterName: string,
        inviteUrl: string,
    ) {
        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #0a0612; color: #f5f3ff; padding: 40px;">
  <div style="max-width: 560px; margin: 0 auto; background: #130a20; padding: 32px; border-radius: 12px;">
    <h1 style="font-size: 24px; margin: 0 0 16px 0;">🪄 YAM</h1>
    <h2 style="font-size: 20px; margin: 0 0 16px 0;">Приглашение в проект</h2>
    <p>Здравствуйте!</p>
    <p><strong>${inviterName}</strong> приглашает вас в проект <strong>${projectName}</strong> на платформе YAM.</p>
    <p style="margin: 24px 0;">
      <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #a855f7, #22d3ee); color: #0a0612; text-decoration: none; border-radius: 8px; font-weight: 600;">Принять приглашение</a>
    </p>
    <p style="font-size: 12px; color: #8b7ba8;">Ссылка действительна 7 дней. Если это не вы — просто проигнорируйте письмо.</p>
    <p style="font-size: 12px; color: #8b7ba8; margin-top: 24px;">YAM. You Are Magic.</p>
  </div>
</body>
</html>
`;

        await this.transporter.sendMail({
            from: 'YAM <no-reply@yam.local>',
            to: email,
            subject: `YAM — приглашение в проект «${projectName}»`,
            html,
        });
    }
}