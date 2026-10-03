//backend/src/modules/gamification/services/xp.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { XpSource } from '../../../generated/prisma/enums.js';

@Injectable()
export class XpService {
    constructor(private prisma: PrismaService) { }

    async addXp(
        userId: string,
        amount: number,
        source: XpSource,
        sourceId?: string,
        note?: string,
    ) {
        if (amount <= 0) return null;

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

    async getTotalXp(userId: string): Promise<number> {
        const result = await this.prisma.client.userXpLog.aggregate({
            where: { userId },
            _sum: { amount: true },
        });
        return result._sum.amount ?? 0;
    }

    async getHistory(userId: string, limit = 50) {
        return this.prisma.client.userXpLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getBySource(userId: string) {
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
}