//backend/src/modules/comments/services/comments.service.ts
import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateCommentDto,
    UpdateCommentDto,
} from '../contracts/comment.dto.js';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, recordId: string, data: CreateCommentDto) {
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

    async findByRecord(userId: string, recordId: string) {
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

    async update(userId: string, id: string, data: UpdateCommentDto) {
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

    async remove(userId: string, id: string) {
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
            await this.membership.assertProjectRole(
                userId,
                comment.record.projectId,
                ['owner', 'admin'],
            );
        }

        return this.prisma.client.comment.delete({ where: { id } });
    }
}