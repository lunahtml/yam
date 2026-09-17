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
//backend/src/modules/fields/fields.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { FieldsService } from './services/fields.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateFieldSchema, } from './contracts/create-field.dto.js';
import { UpdateFieldSchema, } from './contracts/update-field.dto.js';
let FieldsController = class FieldsController {
    fieldsService;
    constructor(fieldsService) {
        this.fieldsService = fieldsService;
    }
    async create(userId, entityId, data) {
        return this.fieldsService.create(userId, entityId, data);
    }
    async findByEntity(userId, entityId) {
        return this.fieldsService.findByEntity(userId, entityId);
    }
    async listTypes(userId, entityId) {
        return this.fieldsService.listTypes(userId, entityId);
    }
    async update(userId, id, data) {
        return this.fieldsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.fieldsService.remove(userId, id);
    }
};
__decorate([
    Post('entity/:entityId'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __param(2, Body(new ZodValidationPipe(CreateFieldSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FieldsController.prototype, "create", null);
__decorate([
    Get('entity/:entityId'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FieldsController.prototype, "findByEntity", null);
__decorate([
    Get('entity/:entityId/types'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FieldsController.prototype, "listTypes", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateFieldSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FieldsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FieldsController.prototype, "remove", null);
FieldsController = __decorate([
    Controller('fields'),
    __metadata("design:paramtypes", [FieldsService])
], FieldsController);
export { FieldsController };
//# sourceMappingURL=fields.controller.js.map