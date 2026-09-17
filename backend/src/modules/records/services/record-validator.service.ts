//backend/src/modules/records/services/record-validator.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { FieldTypeRegistry } from '../field-types/field-type.registry.js';

interface FieldDefinition {
    id: string;
    name: string;
    label: string;
    type: string;
    isRequired: boolean;
    options: unknown;
    defaultValue: unknown;
}

@Injectable()
export class RecordValidatorService {
    /**
     * Валидирует данные записи согласно полям сущности.
     * Возвращает нормализованный объект.
     */
    validate(
        data: Record<string, unknown>,
        fields: FieldDefinition[],
    ): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        const errors: { field: string; message: string }[] = [];

        for (const field of fields) {
            const value = data[field.name];
            const fieldType = FieldTypeRegistry.get(field.type);

            if (!fieldType) {
                errors.push({
                    field: field.name,
                    message: `Unknown field type: ${field.type}`,
                });
                continue;
            }

            // Проверка на обязательность
            if (
                field.isRequired &&
                (value === null || value === undefined || value === '')
            ) {
                // Если есть defaultValue — используем его
                if (field.defaultValue !== null && field.defaultValue !== undefined) {
                    result[field.name] = field.defaultValue;
                    continue;
                }

                errors.push({
                    field: field.name,
                    message: `Field "${field.label}" is required`,
                });
                continue;
            }

            // Если значения нет — пропускаем (оставляем undefined)
            if (value === null || value === undefined) {
                continue;
            }

            // Валидация типа
            try {
                result[field.name] = fieldType.validate(value, field.options);
            } catch (err) {
                errors.push({
                    field: field.name,
                    message:
                        err instanceof Error
                            ? err.message
                            : `Invalid value for field "${field.label}"`,
                });
            }
        }

        // Проверка на лишние поля
        const allowedNames = new Set(fields.map((f) => f.name));
        for (const key of Object.keys(data)) {
            if (!allowedNames.has(key)) {
                errors.push({
                    field: key,
                    message: `Unknown field "${key}"`,
                });
            }
        }

        if (errors.length > 0) {
            throw new BadRequestException({
                message: 'Record validation failed',
                errors,
            });
        }

        return result;
    }

    /**
     * Определяет тип поля по значению.
     * Используется при импорте.
     */
    inferType(value: unknown): string {
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (value instanceof Date) return 'date';
        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
            return 'text';
        }
        return 'text';
    }
}