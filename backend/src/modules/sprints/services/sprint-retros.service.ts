//backend/src/modules/sprints/services/sprint-retros.service.ts
import {
    Injectable,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { CreateRetroDto } from '../contracts/sprint-retro.dto.js';

type RetroField =
    | 'goalAchievement'
    | 'teamwork'
    | 'process'
    | 'quality'
    | 'speed'
    | 'overall';

@Injectable()
export class SprintRetrosService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async upsert(userId: string, sprintId: string, data: CreateRetroDto) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true, status: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        if (sprint.status !== 'ACTIVE' && sprint.status !== 'COMPLETED') {
            throw new BadRequestException(
                'Retro is allowed only for active or completed sprint',
            );
        }

        await this.membership.assertProjectMember(userId, sprint.projectId);

        return this.prisma.client.sprintRetro.upsert({
            where: { sprintId_userId: { sprintId, userId } },
            create: {
                sprintId,
                userId,
                goalAchievement: data.goalAchievement,
                teamwork: data.teamwork,
                process: data.process,
                quality: data.quality,
                speed: data.speed,
                overall: data.overall,
                wellDone: data.wellDone,
                improvements: data.improvements,
                notes: data.notes,
            },
            update: {
                goalAchievement: data.goalAchievement,
                teamwork: data.teamwork,
                process: data.process,
                quality: data.quality,
                speed: data.speed,
                overall: data.overall,
                wellDone: data.wellDone,
                improvements: data.improvements,
                notes: data.notes,
            },
        });
    }

    async findBySprint(userId: string, sprintId: string) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        await this.membership.assertProjectMember(userId, sprint.projectId);

        const retros = await this.prisma.client.sprintRetro.findMany({
            where: { sprintId },
            include: {
                user: {
                    select: { id: true, email: true, name: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        const avg = (field: RetroField): number => {
            const values = retros
                .map((r) => r[field])
                .filter((v): v is number => v !== null && v !== undefined);
            return values.length === 0
                ? 0
                : values.reduce((a, b) => a + b, 0) / values.length;
        };

        return {
            retros,
            averages: {
                goalAchievement: avg('goalAchievement'),
                teamwork: avg('teamwork'),
                process: avg('process'),
                quality: avg('quality'),
                speed: avg('speed'),
                overall: avg('overall'),
            },
            count: retros.length,
        };
    }

    async getMy(userId: string, sprintId: string) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        await this.membership.assertProjectMember(userId, sprint.projectId);

        return this.prisma.client.sprintRetro.findUnique({
            where: { sprintId_userId: { sprintId, userId } },
        });
    }
}