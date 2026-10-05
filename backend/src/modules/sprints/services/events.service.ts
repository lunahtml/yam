//backend/src/modules/sprints/services/events.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { XpService } from '../../gamification/services/xp.service.js';
import { AchievementsService } from '../../gamification/services/achievements.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import { CreateEventDto } from '../contracts/create-event.dto.js';

@Injectable()
export class EventsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
        private xp: XpService,
        private achievements: AchievementsService,
    ) { }

    async create(userId: string, sprintId: string, data: CreateEventDto) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        await this.membership.assertProjectRole(
            userId,
            sprint.projectId,
            EDIT_ROLES,
        );

        const event = await this.prisma.client.sprintEvent.create({
            data: {
                sprintId,
                type: data.type,
                title: data.title,
                body: data.body,
                xp: data.xp,
                createdById: userId,
            },
        });

        if (data.xp > 0) {
            await this.xp.addXp(
                userId,
                data.xp,
                'SPRINT_EVENT',
                event.id,
                `Событие: ${data.title}`,
            );
        }

        // Триггер автоматической ачивки
        try {
            const project = await this.prisma.client.project.findUnique({
                where: { id: sprint.projectId },
                select: { workspace: { select: { organizationId: true } } },
            });
            const organizationId = project?.workspace?.organizationId;

            if (organizationId) {
                const eventCount = await this.prisma.client.sprintEvent.count({
                    where: { createdById: userId },
                });

                if (eventCount === 1) {
                    await this.achievements.grantAutomatic(
                        userId,
                        organizationId,
                        'first_event',
                        'Первое событие спринта',
                    );
                }
            }
        } catch (err) {
            console.error('Event achievements trigger error:', err);
        }

        return event;
    }

    async remove(userId: string, id: string) {
        const event = await this.prisma.client.sprintEvent.findUnique({
            where: { id },
            select: { sprint: { select: { projectId: true } } },
        });

        if (!event) {
            throw new ForbiddenException('Access denied to event');
        }

        await this.membership.assertProjectRole(
            userId,
            event.sprint.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.sprintEvent.delete({
            where: { id },
        });
    }
}