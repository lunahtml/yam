//backend/src/modules/fields/services/fields.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import { FieldTypeRegistry } from '../../records/field-types/field-type.registry.js';
import { CreateFieldDto } from '../contracts/create-field.dto.js';
import { UpdateFieldDto } from '../contracts/update-field.dto.js';

@Injectable()
export class FieldsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    // async create(userId: string, entityId: string, data: CreateFieldDto) {
    //     const entity = await this.prisma.client.entity.findUnique({
    //         where: { id: entityId },
    //         select: { projectId: true },
    //     });

    //     if (!entity) {
    //         throw new ForbiddenException('Access denied to entity');
    //     }

    //     await this.membership.assertProjectRole(
    //         userId,
    //         entity.projectId,
    //         EDIT_ROLES,
    //     );

    //     // Проверка типа поля
    //     if (!FieldTypeRegistry.has(data.type)) {
    //         throw new BadRequestException(
    //             `Unknown field type: ${data.type}. Allowed: ${FieldTypeRegistry.keys().join(', ')}`,
    //         );
    //     }

    //     // Проверка уникальности имени
    //     const exists = await this.prisma.client.field.findUnique({
    //         where: { entityId_name: { entityId, name: data.name } },
    //     });

    //     if (exists) {
    //         throw new ConflictException(
    //             'Field with this name already exists in the entity',
    //         );
    //     }

    //     return this.prisma.client.field.create({
    //         data: {
    //             entityId,
    //             name: data.name,
    //             label: data.label,
    //             type: data.type,
    //             options: data.options as Prisma.InputJsonValue | undefined,
    //             isRequired: data.isRequired,
    //             defaultValue: data.defaultValue as
    //                 | Prisma.InputJsonValue
    //                 | undefined,
    //         },
    //     });
    // }
    async create(userId: string, entityId: string, data: CreateFieldDto) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });

        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }

        await this.membership.assertProjectRole(
            userId,
            entity.projectId,
            EDIT_ROLES,
        );

        // Проверка типа поля
        if (!FieldTypeRegistry.has(data.type)) {
            throw new BadRequestException(
                `Unknown field type: ${data.type}. Allowed: ${FieldTypeRegistry.keys().join(', ')}`,
            );
        }

        // Проверка уникальности имени
        const exists = await this.prisma.client.field.findUnique({
            where: { entityId_name: { entityId, name: data.name } },
        });

        if (exists) {
            throw new ConflictException(
                'Field with this name already exists in the entity',
            );
        }

        // ↓↓↓ НОВОЕ: валидация defaultValue против типа поля
        if (data.defaultValue !== undefined && data.defaultValue !== null) {
            const fieldType = FieldTypeRegistry.get(data.type)!;
            try {
                fieldType.validate(data.defaultValue, data.options);
            } catch {
                throw new BadRequestException(
                    `Invalid defaultValue for field type "${data.type}"`,
                );
            }
        }
        // ↑↑↑ КОНЕЦ НОВОГО

        return this.prisma.client.field.create({
            data: {
                entityId,
                name: data.name,
                label: data.label,
                type: data.type,
                options: data.options as Prisma.InputJsonValue | undefined,
                isRequired: data.isRequired,
                defaultValue: data.defaultValue as
                    | Prisma.InputJsonValue
                    | undefined,
            },
        });
    }
    async findByEntity(userId: string, entityId: string) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });

        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }

        await this.membership.assertProjectMember(userId, entity.projectId);

        return this.prisma.client.field.findMany({
            where: { entityId },
            orderBy: { createdAt: 'asc' },
        });
    }

    // async update(userId: string, id: string, data: UpdateFieldDto) {
    //     const field = await this.prisma.client.field.findUnique({
    //         where: { id },
    //         select: { entityId: true, entity: { select: { projectId: true } } },
    //     });

    //     if (!field) {
    //         throw new ForbiddenException('Access denied to field');
    //     }

    //     await this.membership.assertProjectRole(
    //         userId,
    //         field.entity.projectId,
    //         EDIT_ROLES,
    //     );

    //     return this.prisma.client.field.update({
    //         where: { id },
    //         data: {
    //             label: data.label,
    //             options: data.options
    //                 ? (data.options as Prisma.InputJsonValue)
    //                 : undefined,
    //             isRequired: data.isRequired,
    //             defaultValue:
    //                 data.defaultValue !== undefined
    //                     ? (data.defaultValue as Prisma.InputJsonValue)
    //                     : undefined,
    //         },
    //     });
    // }
    async update(userId: string, id: string, data: UpdateFieldDto) {
        const field = await this.prisma.client.field.findUnique({
            where: { id },
            select: {
                entityId: true,
                type: true,                              // ← ДОБАВЛЕНО
                entity: { select: { projectId: true } },
            },
        });

        if (!field) {
            throw new ForbiddenException('Access denied to field');
        }

        await this.membership.assertProjectRole(
            userId,
            field.entity.projectId,
            EDIT_ROLES,
        );

        // ↓↓↓ НОВОЕ: валидация defaultValue против типа поля
        if (data.defaultValue !== undefined && data.defaultValue !== null) {
            const fieldType = FieldTypeRegistry.get(field.type)!;
            try {
                fieldType.validate(data.defaultValue, data.options);
            } catch {
                throw new BadRequestException(
                    `Invalid defaultValue for field type "${field.type}"`,
                );
            }
        }
        // ↑↑↑ КОНЕЦ НОВОГО

        return this.prisma.client.field.update({
            where: { id },
            data: {
                label: data.label,
                options: data.options
                    ? (data.options as Prisma.InputJsonValue)
                    : undefined,
                isRequired: data.isRequired,
                defaultValue:
                    data.defaultValue !== undefined
                        ? (data.defaultValue as Prisma.InputJsonValue)
                        : undefined,
            },
        });
    }
    async remove(userId: string, id: string) {
        const field = await this.prisma.client.field.findUnique({
            where: { id },
            select: { entityId: true, entity: { select: { projectId: true } } },
        });

        if (!field) {
            throw new ForbiddenException('Access denied to field');
        }

        await this.membership.assertProjectRole(
            userId,
            field.entity.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.field.delete({
            where: { id },
        });
    }

    async listTypes(userId: string, entityId: string) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });

        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }

        await this.membership.assertProjectMember(userId, entity.projectId);

        return FieldTypeRegistry.list().map((t) => ({
            key: t.key,
            label: t.label,
            supportsFiltering: t.supportsFiltering,
            supportsSorting: t.supportsSorting,
            supportsAggregation: t.supportsAggregation,
        }));
    }
}