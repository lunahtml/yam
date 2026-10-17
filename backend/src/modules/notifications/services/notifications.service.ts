//backend\src\modules\notifications\services\notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '../../../generated/prisma/enums.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    projectId?: string;
    sourceId?: string;
    sourceType?: string;
}

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateNotificationData) {
        return this.prisma.client.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                body: data.body,
                projectId: data.projectId,
                sourceId: data.sourceId,
                sourceType: data.sourceType,
            },
        });
    }

    async findForUser(userId: string, limit = 30) {
        return this.prisma.client.notification.findMany({
            where: { userId },
            orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }],
            take: limit,
            include: {
                project: { select: { id: true, name: true } },
            },
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.client.notification.count({
            where: { userId, readAt: null },
        });
    }

    async markRead(userId: string, id: string) {
        const notification = await this.prisma.client.notification.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!notification || notification.userId !== userId) {
            throw new NotFoundException('Notification not found');
        }

        return this.prisma.client.notification.update({
            where: { id },
            data: { readAt: new Date() },
        });
    }

    async markAllRead(userId: string) {
        return this.prisma.client.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }
}