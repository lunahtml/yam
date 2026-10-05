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
let CommentsService = class CommentsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, recordId, data) {
        const record = await this.prisma.client.record.findUnique({
            where: { id: recordId },
            select: { projectId: true },
        });
        if (!record) {
            throw new NotFoundException('Record not found');
        }
        await this.membership.assertProjectMember(userId, record.projectId);
        return this.prisma.client.comment.create({
            data: {
                recordId,
                userId,
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
    }
    async findByRecord(userId, recordId) {
        const record = await this.prisma.client.record.findUnique({
            where: { id: recordId },
            select: { projectId: true },
        });
        if (!record) {
            throw new NotFoundException('Record not found');
        }
        await this.membership.assertProjectMember(userId, record.projectId);
        return this.prisma.client.comment.findMany({
            where: { recordId },
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
        MembershipService])
], CommentsService);
export { CommentsService };
//# sourceMappingURL=comments.service.js.map