var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/records/services/record-index.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
let RecordIndexService = class RecordIndexService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Строит индексные записи для значений Record.data.
     * Вызывается при создании/обновлении Record.
     */
    buildIndexes(data, fields) {
        const entries = [];
        for (const field of fields) {
            const value = data[field.name];
            if (value === null || value === undefined || value === '') {
                continue;
            }
            const entry = {
                fieldName: field.name,
                fieldType: field.type,
                valueText: null,
                valueNumber: null,
                valueDate: null,
                valueBool: null,
            };
            switch (field.type) {
                case 'text':
                case 'select':
                case 'user':
                    entry.valueText = String(value);
                    break;
                case 'number':
                    if (typeof value === 'number' && !Number.isNaN(value)) {
                        entry.valueNumber = value;
                    }
                    break;
                case 'date': {
                    const date = new Date(String(value));
                    if (!Number.isNaN(date.getTime())) {
                        entry.valueDate = date;
                    }
                    break;
                }
                case 'boolean':
                    if (typeof value === 'boolean') {
                        entry.valueBool = value;
                    }
                    break;
                default:
                    entry.valueText = String(value);
            }
            entries.push(entry);
        }
        return entries;
    }
    /**
     * Создаёт индексы для Record внутри транзакции.
     */
    async createIndexes(tx, recordId, entityId, projectId, entries) {
        if (entries.length === 0)
            return;
        await tx.recordIndex.createMany({
            data: entries.map((entry) => ({
                recordId,
                entityId,
                projectId,
                fieldName: entry.fieldName,
                fieldType: entry.fieldType,
                valueText: entry.valueText,
                valueNumber: entry.valueNumber,
                valueDate: entry.valueDate,
                valueBool: entry.valueBool,
            })),
        });
    }
    /**
     * Удаляет старые индексы и создаёт новые.
     * Используется при обновлении Record.
     */
    async replaceIndexes(tx, recordId, entityId, projectId, entries) {
        await tx.recordIndex.deleteMany({
            where: { recordId },
        });
        await this.createIndexes(tx, recordId, entityId, projectId, entries);
    }
    /**
     * Удаляет все индексы Record.
     */
    async deleteIndexes(tx, recordId) {
        await tx.recordIndex.deleteMany({
            where: { recordId },
        });
    }
    /**
     * Возвращает recordId, отсортированные по значению поля.
     * Используется для сортировки.
     */
    async findSortedRecordIds(entityId, fieldName, fieldType, sortDir, skip, take) {
        const valueColumn = this.getValueColumn(fieldType);
        const where = {
            entityId,
            fieldName,
            [valueColumn]: { not: null },
        };
        const [indexes, total] = await Promise.all([
            this.prisma.client.recordIndex.findMany({
                where,
                orderBy: { [valueColumn]: sortDir },
                skip,
                take,
                select: { recordId: true },
            }),
            this.prisma.client.recordIndex.count({ where }),
        ]);
        return {
            recordIds: indexes.map((i) => i.recordId),
            total,
        };
    }
    /**
     * Возвращает recordId, отфильтрованные по значению поля.
     */
    async findFilteredRecordIds(entityId, fieldName, fieldType, value) {
        const valueColumn = this.getValueColumn(fieldType);
        const typedValue = this.parseFilterValue(fieldType, value);
        if (typedValue === null)
            return [];
        const indexes = await this.prisma.client.recordIndex.findMany({
            where: {
                entityId,
                fieldName,
                [valueColumn]: typedValue,
            },
            select: { recordId: true },
        });
        return indexes.map((i) => i.recordId);
    }
    getValueColumn(fieldType) {
        switch (fieldType) {
            case 'number':
                return 'valueNumber';
            case 'date':
                return 'valueDate';
            case 'boolean':
                return 'valueBool';
            default:
                return 'valueText';
        }
    }
    parseFilterValue(fieldType, value) {
        switch (fieldType) {
            case 'number': {
                const num = Number(value);
                return Number.isNaN(num) ? null : num;
            }
            case 'date': {
                const date = new Date(value);
                return Number.isNaN(date.getTime()) ? null : date;
            }
            case 'boolean':
                return value === 'true';
            default:
                return value;
        }
    }
};
RecordIndexService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], RecordIndexService);
export { RecordIndexService };
//# sourceMappingURL=record-index.service.js.map