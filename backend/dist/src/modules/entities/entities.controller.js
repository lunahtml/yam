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
//backend/src/modules/entities/entities.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { EntitiesService } from './services/entities.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateEntitySchema, } from './contracts/create-entity.dto.js';
import { UpdateEntitySchema, } from './contracts/update-entity.dto.js';
import { ENTITY_TEMPLATES } from './templates/entity-templates.js';
let EntitiesController = class EntitiesController {
    entitiesService;
    constructor(entitiesService) {
        this.entitiesService = entitiesService;
    }
    async create(userId, projectId, data) {
        return this.entitiesService.create(userId, projectId, data);
    }
    async getTemplates() {
        return ENTITY_TEMPLATES;
    }
    async createFromTemplate(userId, projectId, data) {
        return this.entitiesService.createFromTemplate(userId, projectId, data.templateKey);
    }
    async findByProject(userId, projectId) {
        return this.entitiesService.findByProject(userId, projectId);
    }
    async findById(userId, id) {
        return this.entitiesService.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.entitiesService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.entitiesService.remove(userId, id);
    }
};
__decorate([
    Post('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(CreateEntitySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "create", null);
__decorate([
    Get('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "getTemplates", null);
__decorate([
    Post('project/:projectId/from-template'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "createFromTemplate", null);
__decorate([
    Get('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "findByProject", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateEntitySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "remove", null);
EntitiesController = __decorate([
    Controller('entities'),
    __metadata("design:paramtypes", [EntitiesService])
], EntitiesController);
export { EntitiesController };
//# sourceMappingURL=entities.controller.js.map