var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
//backend/src/modules/records/records.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, } from '@nestjs/common';
import { RecordsService } from './services/records.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateRecordSchema, } from './contracts/create-record.dto.js';
import { UpdateRecordSchema, } from './contracts/update-record.dto.js';
import { ListRecordsQuerySchema, } from './contracts/list-records.dto.js';
let RecordsController = class RecordsController {
    recordsService;
    constructor(recordsService) {
        this.recordsService = recordsService;
    }
    async create(userId, entityId, data) {
        return this.recordsService.create(userId, entityId, data);
    }
    async findByEntity(userId, entityId, query) {
        return this.recordsService.findByEntity(userId, entityId, query);
    }
    async findById(userId, id) {
        return this.recordsService.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.recordsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.recordsService.remove(userId, id);
    }
};
__decorate([
    Post('entity/:entityId'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __param(2, Body(new ZodValidationPipe(CreateRecordSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "create", null);
__decorate([
    Get('entity/:entityId'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __param(2, Query(new ZodValidationPipe(ListRecordsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "findByEntity", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateRecordSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "remove", null);
RecordsController = __decorate([
    Controller('records'),
    __metadata("design:paramtypes", [RecordsService])
], RecordsController);
export { RecordsController };
//# sourceMappingURL=records.controller.js.map