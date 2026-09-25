var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OnboardingService_1;
//backend/src/modules/onboarding/services/onboarding.service.ts
import { Injectable, ConflictException, Logger, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { UtmDefaultsService } from '../../utm/services/defaults.service.js';
import { ENTITY_TEMPLATES } from '../../entities/templates/entity-templates.js';
const DEMO_ORG_NAME = 'Моя компания';
const DEMO_WORKSPACE_NAME = 'Мой отдел';
const DEMO_PROJECT_NAME = 'Мой первый проект';
const DEMO_PROJECT_DESCRIPTION = 'Демонстрационный проект YAM. Изучи разделы, измени под себя.';
const DEMO_EPIC_NAME = 'Первая инициатива';
const DEMO_EPIC_DESCRIPTION = 'Настроить процесс работы и запустить первую итерацию.';
const DEMO_SPRINT_GOAL = 'Изучить YAM, настроить артефакты, пригласить команду';
const DEMO_TASKS = [
    {
        title: 'Изучить возможности YAM',
        description: 'Пройдись по разделам: спринты, эпики, задачи, артефакты, UTM, маркетинг. Пойми, как всё связано.',
        status: 'done',
        priority: 'medium',
    },
    {
        title: 'Настроить артефакты и UTM',
        description: 'Добавь свои сайты, соцсети, документы. Настрой UTM-метки для отслеживания трафика.',
        status: 'in_progress',
        priority: 'high',
    },
    {
        title: 'Пригласить команду',
        description: 'Пригласи коллег в проект. Каждый получит роль: owner, admin, member или viewer.',
        status: 'todo',
        priority: 'medium',
    },
];
const DEMO_METRICS = [
    {
        key: 'leads',
        label: 'Количество лидов',
        metricType: 'INCREASE',
        targetValue: 30,
        unit: 'шт.',
        xpReward: 100,
    },
    {
        key: 'cpl',
        label: 'Стоимость лида',
        metricType: 'DECREASE',
        targetValue: 500,
        unit: '₽',
        xpReward: 150,
    },
];
const DEMO_ARTIFACTS = [
    {
        type: 'WEBSITE',
        name: 'Сайт компании',
        url: 'https://example.com',
        description: 'Замени на свой сайт — он будет использоваться для UTM-меток.',
    },
    {
        type: 'SOCIAL',
        name: 'Telegram-канал',
        url: 'https://t.me/',
        description: 'Замени на свой канал или добавь новый артефакт.',
    },
];
let OnboardingService = OnboardingService_1 = class OnboardingService {
    prisma;
    utmDefaults;
    logger = new Logger(OnboardingService_1.name);
    constructor(prisma, utmDefaults) {
        this.prisma = prisma;
        this.utmDefaults = utmDefaults;
    }
    /**
     * Создать демо-структуру для нового юзера.
     *
     * Идемпотентность: если у юзера уже есть организация — 409 Conflict.
     * Всё создаётся в одной транзакции: если что-то падает — ничего не остаётся.
     */
    async createDemo(userId) {
        const existingMembership = await this.prisma.client.organizationMember.findFirst({
            where: { userId },
            select: { id: true },
        });
        if (existingMembership) {
            throw new ConflictException('You already have an organization. Demo is only for new users.');
        }
        const taskTemplate = ENTITY_TEMPLATES.find((t) => t.key === 'task');
        if (!taskTemplate) {
            throw new Error('Task template not found — schema misconfigured');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
        const result = await this.prisma.client.$transaction(async (tx) => {
            // 1. Organization + member
            const organization = await tx.organization.create({
                data: { name: DEMO_ORG_NAME },
            });
            await tx.organizationMember.create({
                data: {
                    organizationId: organization.id,
                    userId,
                    role: 'OWNER',
                },
            });
            // 2. Workspace + member
            const workspace = await tx.workspace.create({
                data: {
                    organizationId: organization.id,
                    name: DEMO_WORKSPACE_NAME,
                },
            });
            await tx.workspaceMember.create({
                data: {
                    workspaceId: workspace.id,
                    userId,
                    role: 'owner',
                },
            });
            // 3. Project + member
            const project = await tx.project.create({
                data: {
                    workspaceId: workspace.id,
                    name: DEMO_PROJECT_NAME,
                    description: DEMO_PROJECT_DESCRIPTION,
                    status: 'ACTIVE',
                },
            });
            await tx.projectMember.create({
                data: {
                    projectId: project.id,
                    userId,
                    role: 'owner',
                },
            });
            // 4. UTM defaults (внутри транзакции)
            await this.utmDefaults.createDefaults(project.id, tx);
            // 5. Entity «Задачи» из шаблона
            const entity = await tx.entity.create({
                data: {
                    projectId: project.id,
                    name: taskTemplate.entity.name,
                    label: taskTemplate.entity.label,
                    icon: taskTemplate.entity.icon,
                    isSystem: false,
                },
            });
            // 6. Поля
            for (const f of taskTemplate.fields) {
                await tx.field.create({
                    data: {
                        entityId: entity.id,
                        name: f.name,
                        label: f.label,
                        type: f.type,
                        isRequired: f.isRequired ?? false,
                        options: f.options,
                    },
                });
            }
            // 7. View
            await tx.view.create({
                data: {
                    entityId: entity.id,
                    projectId: project.id,
                    name: taskTemplate.defaultView.name,
                    type: taskTemplate.defaultView.type,
                    config: taskTemplate.defaultView.config,
                    isDefault: true,
                },
            });
            // 8. Epic
            const epic = await tx.epic.create({
                data: {
                    projectId: project.id,
                    name: DEMO_EPIC_NAME,
                    description: DEMO_EPIC_DESCRIPTION,
                    status: 'OPEN',
                    startDate: today,
                    endDate: twoWeeksLater,
                },
            });
            // 9. Sprint #1
            const sprint = await tx.sprint.create({
                data: {
                    projectId: project.id,
                    number: 1,
                    name: 'Спринт #1',
                    goal: DEMO_SPRINT_GOAL,
                    description: 'Первый спринт — знакомство с YAM.',
                    startDate: today,
                    endDate: twoWeeksLater,
                    status: 'ACTIVE',
                    epicId: epic.id,
                },
            });
            // 10. Метрики спринта
            for (const m of DEMO_METRICS) {
                await tx.sprintMetric.create({
                    data: {
                        sprintId: sprint.id,
                        key: m.key,
                        label: m.label,
                        metricType: m.metricType,
                        targetValue: m.targetValue,
                        actualValue: 0,
                        unit: m.unit,
                        xpReward: m.xpReward,
                    },
                });
            }
            // 11. Задачи (Record) в спринте
            const fieldsForIndex = await tx.field.findMany({
                where: { entityId: entity.id },
                select: { name: true, type: true },
            });
            for (const task of DEMO_TASKS) {
                const data = {
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignee: userId,
                    tags: [],
                    checklist: [],
                };
                const record = await tx.record.create({
                    data: {
                        entityId: entity.id,
                        projectId: project.id,
                        data: data,
                        createdById: userId,
                        sprintId: sprint.id,
                    },
                });
                // RecordIndex для сортировки/фильтрации
                const indexRows = [];
                for (const field of fieldsForIndex) {
                    const value = data[field.name];
                    if (value === undefined || value === null || value === '')
                        continue;
                    const row = {
                        recordId: record.id,
                        entityId: entity.id,
                        projectId: project.id,
                        fieldName: field.name,
                        fieldType: field.type,
                        valueText: null,
                        valueNumber: null,
                        valueDate: null,
                        valueBool: null,
                    };
                    switch (field.type) {
                        case 'number':
                            if (typeof value === 'number')
                                row.valueNumber = value;
                            break;
                        case 'date': {
                            const d = new Date(String(value));
                            if (!Number.isNaN(d.getTime()))
                                row.valueDate = d;
                            break;
                        }
                        case 'boolean':
                            if (typeof value === 'boolean')
                                row.valueBool = value;
                            break;
                        default:
                            row.valueText = String(value);
                    }
                    indexRows.push(row);
                }
                if (indexRows.length > 0) {
                    await tx.recordIndex.createMany({ data: indexRows });
                }
            }
            // 12. Артефакты
            for (const a of DEMO_ARTIFACTS) {
                await tx.artifact.create({
                    data: {
                        projectId: project.id,
                        type: a.type,
                        name: a.name,
                        url: a.url,
                        description: a.description,
                        isActive: true,
                    },
                });
            }
            // 13. ActivityLog
            await tx.activityLog.create({
                data: {
                    projectId: project.id,
                    userId,
                    action: 'created',
                    entityType: 'demo_project',
                    entityId: project.id,
                    metadata: {
                        source: 'onboarding',
                        organizationName: DEMO_ORG_NAME,
                    },
                },
            });
            return {
                organizationId: organization.id,
                workspaceId: workspace.id,
                projectId: project.id,
            };
        });
        this.logger.log(`Demo project created for user ${userId} — project ${result.projectId}`);
        return result;
    }
};
OnboardingService = OnboardingService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        UtmDefaultsService])
], OnboardingService);
export { OnboardingService };
//# sourceMappingURL=onboarding.service.js.map