//backend/src/modules/invitations/services/invitations.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EmailService } from '../../../infra/email/email.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import { CreateInvitationDto } from '../contracts/create-invitation.dto.js';

@Injectable()
export class InvitationsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
        private email: EmailService,
    ) { }

    async create(userId: string, projectId: string, data: CreateInvitationDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        // Проверяем проект
        const project = await this.prisma.client.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Проверяем, не зарегистрирован ли user уже
        const existingUser = await this.prisma.client.user.findUnique({
            where: { email: data.email },
            select: { id: true },
        });

        if (existingUser) {
            // Проверяем, не в проекте ли он
            const inProject = await this.prisma.client.projectMember.findUnique({
                where: {
                    projectId_userId: { projectId, userId: existingUser.id },
                },
            });

            if (inProject) {
                throw new ConflictException('User already in project');
            }
        }

        // Проверяем, нет ли уже активного приглашения
        const existingInvite = await this.prisma.client.invitation.findFirst({
            where: {
                projectId,
                email: data.email,
                acceptedAt: null,
                expiresAt: { gt: new Date() },
            },
        });

        if (existingInvite) {
            throw new ConflictException('Invitation already sent to this email');
        }

        // Создаём приглашение
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invitation = await this.prisma.client.invitation.create({
            data: {
                projectId,
                email: data.email,
                role: data.role,
                token,
                invitedById: userId,
                expiresAt,
            },
        });

        // Получаем имя приглашающего
        const inviter = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        });

        const inviterName = inviter?.name ?? inviter?.email ?? 'Кто-то';
        const inviteUrl = `${process.env.APP_URL ?? 'http://localhost'}/invite/${token}`;

        // Отправляем письмо
        await this.email.sendProjectInvitation(
            data.email,
            project.name,
            inviterName,
            inviteUrl,
        );

        return invitation;
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.invitation.findMany({
            where: { projectId },
            include: {
                invitedBy: {
                    select: { id: true, email: true, name: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByToken(token: string) {
        const invitation = await this.prisma.client.invitation.findUnique({
            where: { token },
            include: {
                project: {
                    select: { id: true, name: true, workspaceId: true },
                },
                invitedBy: {
                    select: { id: true, email: true, name: true, avatarUrl: true },
                },
            },
        });

        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.acceptedAt) {
            throw new BadRequestException('Invitation already accepted');
        }

        if (invitation.expiresAt < new Date()) {
            throw new BadRequestException('Invitation expired');
        }

        return invitation;
    }

    async accept(userId: string, token: string) {
        const invitation = await this.findByToken(token);

        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        if (!user || user.email !== invitation.email) {
            throw new ForbiddenException(
                'This invitation is for another email',
            );
        }

        // Проверяем, не в проекте ли уже
        const existing = await this.prisma.client.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: invitation.projectId,
                    userId,
                },
            },
        });

        if (!existing) {
            await this.prisma.client.projectMember.create({
                data: {
                    projectId: invitation.projectId,
                    userId,
                    role: invitation.role as 'owner' | 'admin' | 'member' | 'viewer',
                },
            });
        }

        await this.prisma.client.invitation.update({
            where: { id: invitation.id },
            data: { acceptedAt: new Date() },
        });

        return {
            success: true,
            projectId: invitation.projectId,
            projectName: invitation.project.name,
        };
    }

    async remove(userId: string, id: string) {
        const invitation = await this.prisma.client.invitation.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        await this.membership.assertProjectRole(
            userId,
            invitation.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.invitation.delete({
            where: { id },
        });
    }
}