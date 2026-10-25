//backend/src/modules/workflows/services/workflows.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateWorkflowDto,
    UpdateWorkflowDto,
    CreateStepDto,
    UpdateStepDto,
    CreateTransitionDto,
    UpdateTransitionDto,   // ← ДОБАВЛЕНО
} from '../contracts/workflow.dto.js';
import { Prisma } from '../../../generated/prisma/client.js';

@Injectable()
export class WorkflowsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    // ═══════════════════════════════════════════════════════════════
    // WORKFLOW
    // ═══════════════════════════════════════════════════════════════

    async create(
        userId: string,
        projectId: string,
        entityId: string,
        data: CreateWorkflowDto,
    ) {
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

    async findById(userId: string, id: string) {
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

    async findByEntity(userId: string, entityId: string) {
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
    async findActiveForEntity(
        userId: string,
        entityId: string,
    ) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });

        if (!entity) return null;

        // Не бросаем ForbiddenException — просто проверяем доступ
        try {
            await this.membership.assertProjectMember(userId, entity.projectId);
        } catch {
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

    async update(userId: string, id: string, data: UpdateWorkflowDto) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id },
            select: { projectId: true, entityId: true },
        });

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        await this.membership.assertProjectRole(
            userId,
            workflow.projectId,
            EDIT_ROLES,
        );

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

    async remove(userId: string, id: string) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        await this.membership.assertProjectRole(
            userId,
            workflow.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.workflow.delete({ where: { id } });
    }

    // ═══════════════════════════════════════════════════════════════
    // STEPS
    // ═══════════════════════════════════════════════════════════════

    async addStep(userId: string, workflowId: string, data: CreateStepDto) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id: workflowId },
            select: { projectId: true },
        });

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        await this.membership.assertProjectRole(
            userId,
            workflow.projectId,
            EDIT_ROLES,
        );

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

    async updateStep(
        userId: string,
        workflowId: string,
        stepId: string,
        data: UpdateStepDto,
    ) {
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

        await this.membership.assertProjectRole(
            userId,
            step.workflow.projectId,
            EDIT_ROLES,
        );

        // Если меняем order — проверяем уникальность
        if (data.order !== undefined) {
            const existing = await this.prisma.client.workflowStep.findUnique({
                where: {
                    workflowId_order: { workflowId, order: data.order },
                },
            });

            if (existing && existing.id !== stepId) {
                throw new ConflictException(
                    `Step with order ${data.order} already exists`,
                );
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

    async removeStep(userId: string, workflowId: string, stepId: string) {
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

        await this.membership.assertProjectRole(
            userId,
            step.workflow.projectId,
            DESTRUCTIVE_ROLES,
        );

        // Нельзя удалить шаг, если есть переходы
        if (
            step._count.outgoingTransitions > 0 ||
            step._count.incomingTransitions > 0
        ) {
            throw new BadRequestException(
                'Нельзя удалить шаг с переходами. Сначала удали переходы.',
            );
        }

        return this.prisma.client.workflowStep.delete({ where: { id: stepId } });
    }

    // ═══════════════════════════════════════════════════════════════
    // TRANSITIONS
    // ═══════════════════════════════════════════════════════════════

    async addTransition(
        userId: string,
        workflowId: string,
        data: CreateTransitionDto,
    ) {
        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id: workflowId },
            select: { projectId: true },
        });

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        await this.membership.assertProjectRole(
            userId,
            workflow.projectId,
            EDIT_ROLES,
        );

        const steps = await this.prisma.client.workflowStep.findMany({
            where: {
                id: { in: [data.fromStepId, data.toStepId] },
                workflowId,
            },
            select: { id: true },
        });

        if (steps.length !== 2) {
            throw new BadRequestException(
                'Both steps must belong to the same workflow',
            );
        }

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
                conditions: (data.conditions as Prisma.InputJsonValue) ?? Prisma.JsonNull,
            },
        });
    }

    async removeTransition(
        userId: string,
        workflowId: string,
        transitionId: string,
    ) {
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

        await this.membership.assertProjectRole(
            userId,
            transition.workflow.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.workflowTransition.delete({
            where: { id: transitionId },
        });
    }
    async updateTransition(
        userId: string,
        workflowId: string,
        transitionId: string,
        data: UpdateTransitionDto,
    ) {
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

        await this.membership.assertProjectRole(
            userId,
            transition.workflow.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.workflowTransition.update({
            where: { id: transitionId },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.conditions !== undefined
                    ? { conditions: data.conditions as Prisma.InputJsonValue }
                    : {}),
            },
        });
    }
    /**
     * Проверяет переход + условия.
     *
     * Возвращает { allowed, reason? }.
     * - allowed: true → переход разрешён
     * - allowed: false → причина в reason
     *
     * Fail-open: если workflow нет / шага нет в workflow / from === to → true.
     */
    async canTransition(
        workflowId: string,
        fromName: string,
        toName: string,
        recordData?: Record<string, unknown>,
    ): Promise<{ allowed: boolean; reason?: string }> {
        if (fromName === toName) return { allowed: true };

        const workflow = await this.prisma.client.workflow.findUnique({
            where: { id: workflowId },
            include: {
                steps: { select: { id: true, name: true } },
                transitions: {
                    select: {
                        fromStepId: true,
                        toStepId: true,
                        conditions: true,
                    },
                },
            },
        });

        if (!workflow) return { allowed: true };

        const fromStep = workflow.steps.find((s) => s.name === fromName);
        const toStep = workflow.steps.find((s) => s.name === toName);

        if (!fromStep || !toStep) return { allowed: true };

        const transition = workflow.transitions.find(
            (t) => t.fromStepId === fromStep.id && t.toStepId === toStep.id,
        );

        if (!transition) {
            return {
                allowed: false,
                reason: `Переход «${fromName}» → «${toName}» не разрешён`,
            };
        }

        // Проверка условий
        const condResult = this.evaluateConditions(
            transition.conditions,
            recordData ?? {},
        );

        if (!condResult.allowed) {
            return {
                allowed: false,
                reason: condResult.failedCondition ?? 'Условие перехода не выполнено',
            };
        }

        return { allowed: true };
    }

    /**
 * Проверяет массив условий против данных записи.
 * Возвращает { allowed: boolean, failedCondition?: string }.
 *
 * Пустой массив / null → allowed: true.
 * Все условия должны быть выполнены (AND).
 */
    evaluateConditions(
        conditions: unknown,
        recordData: Record<string, unknown>,
    ): { allowed: boolean; failedCondition?: string } {
        if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
            return { allowed: true };
        }

        for (const cond of conditions) {
            if (!cond || typeof cond !== 'object') continue;
            const c = cond as { type?: string; field?: string; value?: unknown };

            switch (c.type) {
                case 'checklist_done': {
                    const checklist = recordData.checklist;
                    if (Array.isArray(checklist) && checklist.length > 0) {
                        const allDone = checklist.every(
                            (item) =>
                                item &&
                                typeof item === 'object' &&
                                (item as { done?: boolean }).done === true,
                        );
                        if (!allDone) {
                            return {
                                allowed: false,
                                failedCondition: 'Не все пункты чеклиста выполнены',
                            };
                        }
                    }
                    // Если чеклиста нет или он пуст — условие выполнено (пустой чеклист не блокирует)
                    break;
                }

                case 'field_required': {
                    if (!c.field) continue;
                    const val = recordData[c.field];
                    if (val === null || val === undefined || val === '') {
                        return {
                            allowed: false,
                            failedCondition: `Поле «${c.field}» обязательно`,
                        };
                    }
                    break;
                }

                case 'field_value': {
                    if (!c.field) continue;
                    const val = recordData[c.field];
                    if (val !== c.value) {
                        return {
                            allowed: false,
                            failedCondition: `Поле «${c.field}» должно быть «${String(c.value)}»`,
                        };
                    }
                    break;
                }

                default:
                    continue;
            }
        }

        return { allowed: true };
    }
}