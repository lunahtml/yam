var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/comments/services/comments.service.ts
import { Injectable, ForbiddenException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { NotificationsService } from '../../notifications/services/notifications.service.js';
let CommentsService = class CommentsService {
    prisma;
    membership;
    notifications;
    constructor(prisma, membership, notifications) {
        this.prisma = prisma;
        this.membership = membership;
        this.notifications = notifications;
    }
    async create(userId, recordId, data) {
        const record = await this.prisma.client.record.findUnique({
            where: { id: recordId },
            select: {
                projectId: true,
                data: true,
                project: {
                    select: {
                        id: true,
                        name: true,
                        workspace: { select: { organizationId: true } },
                    },
                },
            },
        });
        if (!record) {
            throw new NotFoundException('Record not found');
        }
        await this.membership.assertProjectMember(userId, record.projectId);
        // Валидация parentId
        if (data.parentId) {
            const parent = await this.prisma.client.comment.findUnique({
                where: { id: data.parentId },
                select: { recordId: true, userId: true },
            });
            if (!parent || parent.recordId !== recordId) {
                throw new NotFoundException('Parent comment not found');
            }
        }
        const comment = await this.prisma.client.comment.create({
            data: {
                recordId,
                userId,
                parentId: data.parentId ?? null,
                body: data.body,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        // Парсинг меншенов @[Имя](userId)
        const organizationId = record.project.workspace.organizationId;
        await this.processMentions(comment.id, data.body, userId, record.projectId, organizationId, record.project.name);
        // Уведомление родителю (если ответ)
        if (data.parentId) {
            const parent = await this.prisma.client.comment.findUnique({
                where: { id: data.parentId },
                select: { userId: true },
            });
            if (parent && parent.userId !== userId) {
                await this.notifications.create({
                    userId: parent.userId,
                    type: 'COMMENT',
                    title: 'Ответ на ваш комментарий',
                    body: data.body.slice(0, 200),
                    projectId: record.projectId,
                    sourceId: comment.id,
                    sourceType: 'comment',
                });
            }
        }
        return comment;
    }
    /**
     * Парсит меншены в формате @[Имя](userId),
     * проверяет, что упомянутые — члены организации,
     * создаёт уведомления.
     */
    async processMentions(commentId, body, authorId, projectId, organizationId, projectName) {
        const mentionRegex = /@\[([^\]]+)\]\(([0-9a-f-]{36})\)/gi;
        const matches = [...body.matchAll(mentionRegex)];
        if (matches.length === 0)
            return;
        const mentionedIds = new Set(matches.map((m) => m[2]).filter((id) => id !== authorId));
        if (mentionedIds.size === 0)
            return;
        // Проверка: все упомянутые — члены организации
        const validMembers = await this.prisma.client.organizationMember.findMany({
            where: {
                organizationId,
                userId: { in: [...mentionedIds] },
            },
            select: { userId: true },
        });
        const validIds = validMembers.map((m) => m.userId);
        for (const uid of validIds) {
            await this.notifications.create({
                userId: uid,
                type: 'MENTION',
                title: `Вас упомянули в задаче (${projectName})`,
                body: body.slice(0, 200),
                projectId,
                sourceId: commentId,
                sourceType: 'comment',
            });
        }
    }
    async findByRecord(userId, recordId) {
        const record = await this.prisma.client.record.findUnique({
            where: { id: recordId },
            select: { projectId: true },
        });
        if (!record) {
            throw new NotFoundException('Record not found');
        }
        // Проверка: член проекта ИЛИ член организации (read-only)
        try {
            await this.membership.assertProjectMember(userId, record.projectId);
        }
        catch {
            const project = await this.prisma.client.project.findUnique({
                where: { id: record.projectId },
                select: { workspace: { select: { organizationId: true } } },
            });
            const organizationId = project?.workspace?.organizationId;
            if (!organizationId) {
                throw new ForbiddenException('Access denied');
            }
            await this.membership.assertOrganizationMember(userId, organizationId);
        }
        return this.prisma.client.comment.findMany({
            where: { recordId, parentId: null },
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async update(userId, id, data) {
        const comment = await this.prisma.client.comment.findUnique({
            where: { id },
            select: { userId: true, record: { select: { projectId: true } } },
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new ForbiddenException('Can only edit own comments');
        }
        return this.prisma.client.comment.update({
            where: { id },
            data: { body: data.body },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async remove(userId, id) {
        const comment = await this.prisma.client.comment.findUnique({
            where: { id },
            select: {
                userId: true,
                record: { select: { projectId: true } },
            },
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        // Автор может удалить свой; admin / owner — любой
        if (comment.userId !== userId) {
            await this.membership.assertProjectRole(userId, comment.record.projectId, ['owner', 'admin']);
        }
        return this.prisma.client.comment.delete({ where: { id } });
    }
};
CommentsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService,
        NotificationsService])
], CommentsService);
export { CommentsService };
//# sourceMappingURL=comments.service.js.map