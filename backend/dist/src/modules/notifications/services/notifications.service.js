var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend\src\modules\notifications\services\notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async findForUser(userId, limit = 30) {
        return this.prisma.client.notification.findMany({
            where: { userId },
            orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }],
            take: limit,
            include: {
                project: { select: { id: true, name: true } },
            },
        });
    }
    async getUnreadCount(userId) {
        return this.prisma.client.notification.count({
            where: { userId, readAt: null },
        });
    }
    async markRead(userId, id) {
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
    async markAllRead(userId) {
        return this.prisma.client.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }
};
NotificationsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], NotificationsService);
export { NotificationsService };
//# sourceMappingURL=notifications.service.js.map