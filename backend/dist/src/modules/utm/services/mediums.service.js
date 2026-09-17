var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/utm/services/mediums.service.ts
import { Injectable, ForbiddenException, ConflictException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let MediumsService = class MediumsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        const exists = await this.prisma.client.utmMedium.findUnique({
            where: { projectId_name: { projectId, name: data.name } },
        });
        if (exists) {
            throw new ConflictException('Medium with this name already exists');
        }
        return this.prisma.client.utmMedium.create({
            data: {
                projectId,
                name: data.name,
                label: data.label,
                isSystem: false,
            },
        });
    }
    async findByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        return this.prisma.client.utmMedium.findMany({
            where: { projectId },
            orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        });
    }
    async update(userId, id, data) {
        const medium = await this.prisma.client.utmMedium.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!medium) {
            throw new ForbiddenException('Access denied to medium');
        }
        await this.membership.assertProjectRole(userId, medium.projectId, EDIT_ROLES);
        return this.prisma.client.utmMedium.update({
            where: { id },
            data: {
                label: data.label,
            },
        });
    }
    async remove(userId, id) {
        const medium = await this.prisma.client.utmMedium.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!medium) {
            throw new ForbiddenException('Access denied to medium');
        }
        await this.membership.assertProjectRole(userId, medium.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.utmMedium.delete({
            where: { id },
        });
    }
};
MediumsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], MediumsService);
export { MediumsService };
//# sourceMappingURL=mediums.service.js.map