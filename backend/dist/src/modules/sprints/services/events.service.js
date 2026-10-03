var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/events.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { XpService } from '../../gamification/services/xp.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let EventsService = class EventsService {
    prisma;
    membership;
    xp;
    constructor(prisma, membership, xp) {
        this.prisma = prisma;
        this.membership = membership;
        this.xp = xp;
    }
    async create(userId, sprintId, data) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectRole(userId, sprint.projectId, EDIT_ROLES);
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
            await this.xp.addXp(userId, data.xp, 'SPRINT_EVENT', event.id, `Событие: ${data.title}`);
        }
        return event;
    }
    async remove(userId, id) {
        const event = await this.prisma.client.sprintEvent.findUnique({
            where: { id },
            select: { sprint: { select: { projectId: true } } },
        });
        if (!event) {
            throw new ForbiddenException('Access denied to event');
        }
        await this.membership.assertProjectRole(userId, event.sprint.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.sprintEvent.delete({
            where: { id },
        });
    }
};
EventsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService,
        XpService])
], EventsService);
export { EventsService };
//# sourceMappingURL=events.service.js.map