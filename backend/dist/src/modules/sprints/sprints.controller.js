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
//backend/src/modules/sprints/sprints.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { SprintsService } from './services/sprints.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateSprintSchema, } from './contracts/create-sprint.dto.js';
import { UpdateSprintSchema, } from './contracts/update-sprint.dto.js';
let SprintsController = class SprintsController {
    sprintsService;
    constructor(sprintsService) {
        this.sprintsService = sprintsService;
    }
    async create(userId, projectId, data) {
        return this.sprintsService.create(userId, projectId, data);
    }
    async findByProject(userId, projectId) {
        return this.sprintsService.findByProject(userId, projectId);
    }
    async findById(userId, id) {
        return this.sprintsService.findById(userId, id);
    }
    async findRecords(userId, id) {
        return this.sprintsService.findRecords(userId, id);
    }
    async update(userId, id, data) {
        return this.sprintsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.sprintsService.remove(userId, id);
    }
};
__decorate([
    Post('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(CreateSprintSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "create", null);
__decorate([
    Get('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "findByProject", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "findById", null);
__decorate([
    Get(':id/records'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "findRecords", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateSprintSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "remove", null);
SprintsController = __decorate([
    Controller('sprints'),
    __metadata("design:paramtypes", [SprintsService])
], SprintsController);
export { SprintsController };
//# sourceMappingURL=sprints.controller.js.map