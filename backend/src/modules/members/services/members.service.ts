//backend/src/modules/members/services/members.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import { AddMemberDto, UpdateMemberDto } from '../contracts/add-member.dto.js';

@Injectable()
export class MembersService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async findByProject(userId: string, projectId: string) {
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
        const membersWithSkills = await Promise.all(
            members.map(async (m) => {
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
            }),
        );

        return membersWithSkills;
    }

    async add(userId: string, projectId: string, data: AddMemberDto) {
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
                role: data.role as 'owner' | 'admin' | 'member' | 'viewer',
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

    async updateRole(
        userId: string,
        projectId: string,
        memberId: string,
        data: UpdateMemberDto,
    ) {
        await this.membership.assertProjectRole(
            userId,
            projectId,
            DESTRUCTIVE_ROLES,
        );

        const member = await this.prisma.client.projectMember.findFirst({
            where: { id: memberId, projectId },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        return this.prisma.client.projectMember.update({
            where: { id: memberId },
            data: { role: data.role as 'owner' | 'admin' | 'member' | 'viewer' },
        });
    }

    async remove(userId: string, projectId: string, memberId: string) {
        await this.membership.assertProjectRole(
            userId,
            projectId,
            DESTRUCTIVE_ROLES,
        );

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
}