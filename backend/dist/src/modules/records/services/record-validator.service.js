var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend/src/modules/records/services/record-validator.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { FieldTypeRegistry } from '../field-types/field-type.registry.js';
let RecordValidatorService = class RecordValidatorService {
    /**
     * Валидирует данные записи согласно полям сущности.
     * Возвращает нормализованный объект.
     */
    validate(data, fields) {
        const result = {};
        const errors = [];
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
            if (field.isRequired &&
                (value === null || value === undefined || value === '')) {
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
            }
            catch (err) {
                errors.push({
                    field: field.name,
                    message: err instanceof Error
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
    inferType(value) {
        if (typeof value === 'boolean')
            return 'boolean';
        if (typeof value === 'number')
            return 'number';
        if (value instanceof Date)
            return 'date';
        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(value))
                return 'date';
            return 'text';
        }
        return 'text';
    }
};
RecordValidatorService = __decorate([
    Injectable()
], RecordValidatorService);
export { RecordValidatorService };
//# sourceMappingURL=record-validator.service.js.map