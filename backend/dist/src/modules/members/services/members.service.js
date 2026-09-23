var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/members/services/members.service.ts
import { Injectable, ConflictException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let MembersService = class MembersService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async findByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        const members = await this.prisma.client.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        // Для каждого — топ-5 навыков
        const membersWithSkills = await Promise.all(members.map(async (m) => {
            const skills = await this.prisma.client.userSkill.findMany({
                where: { userId: m.userId },
                take: 5,
                orderBy: { level: 'desc' },
                include: {
                    skill: {
                        select: { id: true, name: true, label: true, type: true },
                    },
                },
            });
            return {
                ...m,
                skills: skills.map((s) => ({
                    id: s.id,
                    level: s.level,
                    levelLabel: s.levelLabel,
                    skill: s.skill,
                })),
            };
        }));
        return membersWithSkills;
    }
    async add(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        // Проверяем, что user существует
        const targetUser = await this.prisma.client.user.findUnique({
            where: { id: data.userId },
            select: { id: true, status: true },
        });
        if (!targetUser || targetUser.status !== 'ACTIVE') {
            throw new NotFoundException('User not found or inactive');
        }
        // Проверяем, что ещё не добавлен
        const exists = await this.prisma.client.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId: data.userId },
            },
        });
        if (exists) {
            throw new ConflictException('User already in project');
        }
        return this.prisma.client.projectMember.create({
            data: {
                projectId,
                userId: data.userId,
                role: data.role,
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
    async updateRole(userId, projectId, memberId, data) {
        await this.membership.assertProjectRole(userId, projectId, DESTRUCTIVE_ROLES);
        const member = await this.prisma.client.projectMember.findFirst({
            where: { id: memberId, projectId },
        });
        if (!member) {
            throw new NotFoundException('Member not found');
        }
        return this.prisma.client.projectMember.update({
            where: { id: memberId },
            data: { role: data.role },
        });
    }
    async remove(userId, projectId, memberId) {
        await this.membership.assertProjectRole(userId, projectId, DESTRUCTIVE_ROLES);
        const member = await this.prisma.client.projectMember.findFirst({
            where: { id: memberId, projectId },
        });
        if (!member) {
            throw new NotFoundException('Member not found');
        }
        return this.prisma.client.projectMember.delete({
            where: { id: memberId },
        });
    }
};
MembersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], MembersService);
export { MembersService };
//# sourceMappingURL=members.service.js.map