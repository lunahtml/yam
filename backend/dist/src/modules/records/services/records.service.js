var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/records/services/records.service.ts
import { Injectable, ForbiddenException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES, } from '../../../common/types/roles.type.js';
import { RecordValidatorService } from './record-validator.service.js';
import { RecordIndexService } from './record-index.service.js';
import { UserSkillsService } from '../../skills/services/user-skills.service.js';
let RecordsService = class RecordsService {
    prisma;
    membership;
    validator;
    indexer;
    userSkills;
    constructor(prisma, membership, validator, indexer, userSkills) {
        this.prisma = prisma;
        this.membership = membership;
        this.validator = validator;
        this.indexer = indexer;
        this.userSkills = userSkills;
    }
    async create(userId, entityId, data) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: {
                projectId: true,
                fields: true,
            },
        });
        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }
        await this.membership.assertProjectRole(userId, entity.projectId, EDIT_ROLES);
        const validated = this.validator.validate(data.data, entity.fields);
        const indexes = this.indexer.buildIndexes(validated, entity.fields);
        const createData = {
            entityId,
            projectId: entity.projectId,
            data: validated,
            createdById: userId,
            sprintId: data.sprintId ?? null,
        };
        return this.prisma.client.$transaction(async (tx) => {
            const record = await tx.record.create({ data: createData });
            await this.indexer.createIndexes(tx, record.id, entityId, entity.projectId, indexes);
            return record;
        });
    }
    async findByEntity(userId, entityId, query) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true, fields: true },
        });
        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }
        await this.membership.assertProjectMember(userId, entity.projectId);
        const skip = (query.page - 1) * query.limit;
        let filteredRecordIds = null;
        if (query.filterField && query.filterValue !== undefined) {
            const field = entity.fields.find((f) => f.name === query.filterField);
            if (!field) {
                throw new NotFoundException(`Field "${query.filterField}" not found in entity`);
            }
            filteredRecordIds = await this.indexer.findFilteredRecordIds(entityId, query.filterField, field.type, query.filterValue);
            if (filteredRecordIds.length === 0) {
                return {
                    records: [],
                    total: 0,
                    page: query.page,
                    limit: query.limit,
                    pages: 0,
                };
            }
        }
        const sprintFilter = query.sprintId !== undefined
            ? {
                sprintId: query.sprintId === 'null' ? null : query.sprintId,
            }
            : {};
        let records = [];
        let total = 0;
        if (query.sortBy) {
            const field = entity.fields.find((f) => f.name === query.sortBy);
            if (!field) {
                throw new NotFoundException(`Field "${query.sortBy}" not found in entity`);
            }
            const { recordIds, total: sortedTotal } = await this.indexer.findSortedRecordIds(entityId, query.sortBy, field.type, query.sortDir, skip, query.limit);
            const finalIds = filteredRecordIds
                ? recordIds.filter((id) => filteredRecordIds.includes(id))
                : recordIds;
            records = await this.prisma.client.record.findMany({
                where: {
                    id: { in: finalIds },
                    ...sprintFilter,
                },
                include: {
                    creator: {
                        select: { id: true, email: true, name: true },
                    },
                    sprint: {
                        select: { id: true, name: true, number: true },
                    },
                },
            });
            const orderMap = new Map(finalIds.map((id, i) => [id, i]));
            records.sort((a, b) => (orderMap.get(a.id) ?? 0) -
                (orderMap.get(b.id) ?? 0));
            total = filteredRecordIds
                ? filteredRecordIds.length
                : sortedTotal;
        }
        else {
            const where = {
                entityId,
                projectId: entity.projectId,
                ...(filteredRecordIds ? { id: { in: filteredRecordIds } } : {}),
                ...sprintFilter,
            };
            const [found, count] = await Promise.all([
                this.prisma.client.record.findMany({
                    where,
                    orderBy: { createdAt: query.sortDir },
                    skip,
                    take: query.limit,
                    include: {
                        creator: {
                            select: { id: true, email: true, name: true },
                        },
                        sprint: {
                            select: { id: true, name: true, number: true },
                        },
                    },
                }),
                this.prisma.client.record.count({ where }),
            ]);
            records = found;
            total = count;
        }
        return {
            records,
            total,
            page: query.page,
            limit: query.limit,
            pages: Math.ceil(total / query.limit),
        };
    }
    async findById(userId, id) {
        const record = await this.prisma.client.record.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!record) {
            throw new ForbiddenException('Access denied to record');
        }
        await this.membership.assertProjectMember(userId, record.projectId);
        return this.prisma.client.record.findUnique({
            where: { id },
            include: {
                entity: {
                    select: { id: true, name: true, label: true, fields: true },
                },
                creator: { select: { id: true, email: true, name: true } },
                sprint: {
                    select: { id: true, name: true, number: true },
                },
            },
        });
    }
    async update(userId, id, data) {
        const record = await this.prisma.client.record.findUnique({
            where: { id },
            select: {
                projectId: true,
                entityId: true,
                data: true,
                entity: { select: { fields: true } },
            },
        });
        if (!record) {
            throw new ForbiddenException('Access denied to record');
        }
        await this.membership.assertProjectRole(userId, record.projectId, EDIT_ROLES);
        const validated = data.data
            ? this.validator.validate(data.data, record.entity.fields)
            : record.data;
        const indexes = this.indexer.buildIndexes(validated, record.entity.fields);
        const updateData = {
            data: validated,
        };
        if (data.sprintId !== undefined) {
            updateData.sprintId = data.sprintId;
        }
        const updated = await this.prisma.client.$transaction(async (tx) => {
            const result = await tx.record.update({
                where: { id },
                data: updateData,
            });
            await this.indexer.replaceIndexes(tx, id, record.entityId, record.projectId, indexes);
            return result;
        });
        const oldData = record.data;
        const oldStatus = String(oldData.status ?? '');
        const newStatus = String(validated.status ?? '');
        if (oldStatus !== 'done' && newStatus === 'done') {
            await this.processTaskCompletion(id, record.projectId, validated);
        }
        return updated;
    }
    async processTaskCompletion(recordId, projectId, data) {
        try {
            const tags = Array.isArray(data.tags) ? data.tags : [];
            if (tags.length === 0)
                return;
            const project = await this.prisma.client.project.findUnique({
                where: { id: projectId },
                select: {
                    workspace: {
                        select: { organizationId: true },
                    },
                },
            });
            if (!project?.workspace?.organizationId)
                return;
            const organizationId = project.workspace.organizationId;
            const tagRecords = await this.prisma.client.tag.findMany({
                where: {
                    organizationId,
                    name: { in: tags },
                    skillId: { not: null },
                },
                select: { id: true, skillId: true },
            });
            if (tagRecords.length === 0)
                return;
            const userIds = new Set();
            if (data.assignee && typeof data.assignee === 'string') {
                userIds.add(data.assignee);
            }
            if (Array.isArray(data.coAssignees)) {
                for (const uid of data.coAssignees) {
                    if (typeof uid === 'string')
                        userIds.add(uid);
                }
            }
            if (userIds.size === 0)
                return;
            const complexity = await this.prisma.client.taskComplexity.findUnique({
                where: { recordId },
                select: { finalComplexity: true },
            });
            const weight = complexity?.finalComplexity ?? 1;
            for (const uid of userIds) {
                for (const tag of tagRecords) {
                    if (!tag.skillId)
                        continue;
                    const userSkill = await this.userSkills.getOrCreate(uid, tag.skillId, organizationId);
                    await this.userSkills.addEvidence(uid, userSkill.id, {
                        type: 'TASK_COMPLETED',
                        weight,
                        sourceId: recordId,
                        sourceType: 'record',
                        comment: `Закрыта задача с тегом #${tags[0]}`,
                    });
                }
            }
        }
        catch (err) {
            console.error('X-Matrix error:', err);
        }
    }
    async remove(userId, id) {
        const record = await this.prisma.client.record.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!record) {
            throw new ForbiddenException('Access denied to record');
        }
        await this.membership.assertProjectRole(userId, record.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.record.delete({
            where: { id },
        });
    }
};
RecordsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService,
        RecordValidatorService,
        RecordIndexService,
        UserSkillsService])
], RecordsService);
export { RecordsService };
//# sourceMappingURL=records.service.js.map