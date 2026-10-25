var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/workflows/services/workflows.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let WorkflowsService = class WorkflowsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    // ═══════════════════════════════════════════════════════════════
    // WORKFLOW
    // ═══════════════════════════════════════════════════════════════
    async create(userId, projectId, entityId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        // Проверяем, что entity принадлежит проекту
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });
        if (!entity || entity.projectId !== projectId) {
            throw new NotFoundException('Entity not found in this project');
        }
        // Если isActive=true — снимаем активность у других workflow этой entity
        if (data.isActive) {
            await this.prisma.client.workflow.updateMany({
                where: { entityId, isActive: true },
                data: { isActive: false },
            });
        }
        return this.prisma.client.workflow.create({
            data: {
                projectId,
                entityId,
                name: data.name,
                isActive: data.isActive ?? false,
            },
            include: {
                steps: { orderBy: { order: 'asc' } },
                transitions: true,
            },
        });
    }
    async findById(userId, id) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id },
            include: {
                steps: { orderBy: { order: 'asc' } },
                transitions: true,
                entity: { select: { id: true, name: true, label: true } },
            },
        });
        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }
        await this.membership.assertProjectMember(userId, workflow.projectId);
        return workflow;
    }
    async findByEntity(userId, entityId) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }
        await this.membership.assertProjectMember(userId, entity.projectId);
        return this.prisma.client.workflow.findMany({
            where: { entityId },
            include: {
                steps: { orderBy: { order: 'asc' } },
                _count: { select: { transitions: true } },
            },
            orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
        });
    }
    /**
     * Возвращает активный workflow для entity (или null, если нет).
     * Не бросает ошибку — fail-open.
     */
    async findActiveForEntity(userId, entityId) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });
        if (!entity)
            return null;
        // Не бросаем ForbiddenException — просто проверяем доступ
        try {
            await this.membership.assertProjectMember(userId, entity.projectId);
        }
        catch {
            return null;
        }
        const workflow = await this.prisma.client.workflow.findFirst({
            where: { entityId, isActive: true },
            include: {
                steps: { orderBy: { order: 'asc' } },
                transitions: true,
            },
        });
        return workflow ?? null;
    }
    async update(userId, id, data) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id },
            select: { projectId: true, entityId: true },
        });
        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }
        await this.membership.assertProjectRole(userId, workflow.projectId, EDIT_ROLES);
        // Если активируем — снимаем активность у других
        if (data.isActive === true) {
            await this.prisma.client.workflow.updateMany({
                where: { entityId: workflow.entityId, isActive: true, id: { not: id } },
                data: { isActive: false },
            });
        }
        return this.prisma.client.workflow.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
            include: {
                steps: { orderBy: { order: 'asc' } },
                transitions: true,
            },
        });
    }
    async remove(userId, id) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }
        await this.membership.assertProjectRole(userId, workflow.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.workflow.delete({ where: { id } });
    }
    // ═══════════════════════════════════════════════════════════════
    // STEPS
    // ═══════════════════════════════════════════════════════════════
    async addStep(userId, workflowId, data) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id: workflowId },
            select: { projectId: true },
        });
        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }
        await this.membership.assertProjectRole(userId, workflow.projectId, EDIT_ROLES);
        // Проверка: order уникален в workflow
        const existing = await this.prisma.client.workflowStep.findUnique({
            where: { workflowId_order: { workflowId, order: data.order } },
        });
        if (existing) {
            throw new ConflictException(`Step with order ${data.order} already exists`);
        }
        return this.prisma.client.workflowStep.create({
            data: {
                workflowId,
                name: data.name,
                order: data.order,
                color: data.color,
            },
        });
    }
    async updateStep(userId, workflowId, stepId, data) {
        const step = await this.prisma.client.workflowStep.findUnique({
            where: { id: stepId },
            select: {
                workflowId: true,
                workflow: { select: { projectId: true } },
            },
        });
        if (!step || step.workflowId !== workflowId) {
            throw new NotFoundException('Step not found');
        }
        await this.membership.assertProjectRole(userId, step.workflow.projectId, EDIT_ROLES);
        // Если меняем order — проверяем уникальность
        if (data.order !== undefined) {
            const existing = await this.prisma.client.workflowStep.findUnique({
                where: {
                    workflowId_order: { workflowId, order: data.order },
                },
            });
            if (existing && existing.id !== stepId) {
                throw new ConflictException(`Step with order ${data.order} already exists`);
            }
        }
        return this.prisma.client.workflowStep.update({
            where: { id: stepId },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.order !== undefined ? { order: data.order } : {}),
                ...(data.color !== undefined ? { color: data.color } : {}),
            },
        });
    }
    async removeStep(userId, workflowId, stepId) {
        const step = await this.prisma.client.workflowStep.findUnique({
            where: { id: stepId },
            select: {
                workflowId: true,
                workflow: { select: { projectId: true } },
                _count: {
                    select: {
                        outgoingTransitions: true,
                        incomingTransitions: true,
                    },
                },
            },
        });
        if (!step || step.workflowId !== workflowId) {
            throw new NotFoundException('Step not found');
        }
        await this.membership.assertProjectRole(userId, step.workflow.projectId, DESTRUCTIVE_ROLES);
        // Нельзя удалить шаг, если есть переходы
        if (step._count.outgoingTransitions > 0 ||
            step._count.incomingTransitions > 0) {
            throw new BadRequestException('Нельзя удалить шаг с переходами. Сначала удали переходы.');
        }
        return this.prisma.client.workflowStep.delete({ where: { id: stepId } });
    }
    // ═══════════════════════════════════════════════════════════════
    // TRANSITIONS
    // ═══════════════════════════════════════════════════════════════
    async addTransition(userId, workflowId, data) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id: workflowId },
            select: { projectId: true },
        });
        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }
        await this.membership.assertProjectRole(userId, workflow.projectId, EDIT_ROLES);
        // Проверка: оба шага принадлежат этому workflow
        const steps = await this.prisma.client.workflowStep.findMany({
            where: {
                id: { in: [data.fromStepId, data.toStepId] },
                workflowId,
            },
            select: { id: true },
        });
        if (steps.length !== 2) {
            throw new BadRequestException('Both steps must belong to the same workflow');
        }
        // Проверка: нет дубля
        const existing = await this.prisma.client.workflowTransition.findFirst({
            where: {
                workflowId,
                fromStepId: data.fromStepId,
                toStepId: data.toStepId,
            },
        });
        if (existing) {
            throw new ConflictException('This transition already exists');
        }
        return this.prisma.client.workflowTransition.create({
            data: {
                workflowId,
                fromStepId: data.fromStepId,
                toStepId: data.toStepId,
                name: data.name,
            },
        });
    }
    async removeTransition(userId, workflowId, transitionId) {
        const transition = await this.prisma.client.workflowTransition.findUnique({
            where: { id: transitionId },
            select: {
                workflowId: true,
                workflow: { select: { projectId: true } },
            },
        });
        if (!transition || transition.workflowId !== workflowId) {
            throw new NotFoundException('Transition not found');
        }
        await this.membership.assertProjectRole(userId, transition.workflow.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.workflowTransition.delete({
            where: { id: transitionId },
        });
    }
    // ═══════════════════════════════════════════════════════════════
    // CAN TRANSITION (fail-open)
    // ═══════════════════════════════════════════════════════════════
    /**
     * Проверяет, разрешён ли переход from → to в workflow.
     *
     * Логика fail-open:
     * - workflow не найден → true (разрешено)
     * - from === to → true (не переход)
     * - переход найден → true
     * - переход не найден → false (запрещено)
     */
    async canTransition(workflowId, fromName, toName) {
        if (fromName === toName)
            return true;
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id: workflowId },
            include: {
                steps: { select: { id: true, name: true } },
                transitions: {
                    select: {
                        fromStepId: true,
                        toStepId: true,
                    },
                },
            },
        });
        if (!workflow)
            return true;
        const fromStep = workflow.steps.find((s) => s.name === fromName);
        const toStep = workflow.steps.find((s) => s.name === toName);
        // Если шага нет в workflow — fail-open (разрешаем)
        // Это может быть статус вне workflow — не блокируем
        if (!fromStep || !toStep)
            return true;
        return workflow.transitions.some((t) => t.fromStepId === fromStep.id && t.toStepId === toStep.id);
    }
};
WorkflowsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], WorkflowsService);
export { WorkflowsService };
//# sourceMappingURL=workflows.service.js.map