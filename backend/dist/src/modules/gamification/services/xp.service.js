var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/gamification/services/xp.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
let XpService = class XpService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addXp(userId, amount, source, sourceId, note) {
        if (amount <= 0)
            return null;
        return this.prisma.client.userXpLog.create({
            data: {
                userId,
                amount,
                source,
                sourceId,
                note,
            },
        });
    }
    async getTotalXp(userId) {
        const result = await this.prisma.client.userXpLog.aggregate({
            where: { userId },
            _sum: { amount: true },
        });
        return result._sum.amount ?? 0;
    }
    async getHistory(userId, limit = 50) {
        return this.prisma.client.userXpLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getBySource(userId) {
        const result = await this.prisma.client.userXpLog.groupBy({
            by: ['source'],
            where: { userId },
            _sum: { amount: true },
        });
        return result.map((r) => ({
            source: r.source,
            total: r._sum.amount ?? 0,
        }));
    }
};
XpService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], XpService);
export { XpService };
//# sourceMappingURL=xp.service.js.map