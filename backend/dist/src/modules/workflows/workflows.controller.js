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
//backend/src/modules/workflows/workflows.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, } from '@nestjs/common';
import { WorkflowsService } from './services/workflows.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateWorkflowSchema, UpdateWorkflowSchema, CreateStepSchema, UpdateStepSchema, CreateTransitionSchema, } from './contracts/workflow.dto.js';
let WorkflowsController = class WorkflowsController {
    service;
    constructor(service) {
        this.service = service;
    }
    // ═══ WORKFLOW ═══
    async create(userId, projectId, entityId, data) {
        return this.service.create(userId, projectId, entityId, data);
    }
    async findByEntity(userId, entityId) {
        return this.service.findByEntity(userId, entityId);
    }
    async findActiveForEntity(userId, entityId) {
        return this.service.findActiveForEntity(userId, entityId);
    }
    async findById(userId, id) {
        return this.service.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.service.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.service.remove(userId, id);
    }
    async canTransition(userId, id, from, to) {
        // Проверка доступа
        await this.service.findById(userId, id);
        const allowed = await this.service.canTransition(id, from, to);
        return { allowed };
    }
    // ═══ STEPS ═══
    async addStep(userId, workflowId, data) {
        return this.service.addStep(userId, workflowId, data);
    }
    async updateStep(userId, workflowId, stepId, data) {
        return this.service.updateStep(userId, workflowId, stepId, data);
    }
    async removeStep(userId, workflowId, stepId) {
        return this.service.removeStep(userId, workflowId, stepId);
    }
    // ═══ TRANSITIONS ═══
    async addTransition(userId, workflowId, data) {
        return this.service.addTransition(userId, workflowId, data);
    }
    async removeTransition(userId, workflowId, transitionId) {
        return this.service.removeTransition(userId, workflowId, transitionId);
    }
};
__decorate([
    Post('project/:projectId/entity/:entityId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Param('entityId')),
    __param(3, Body(new ZodValidationPipe(CreateWorkflowSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "create", null);
__decorate([
    Get('entity/:entityId'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "findByEntity", null);
__decorate([
    Get('entity/:entityId/active'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "findActiveForEntity", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateWorkflowSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "remove", null);
__decorate([
    Get(':id/can-transition'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Query('from')),
    __param(3, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "canTransition", null);
__decorate([
    Post(':id/steps'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(CreateStepSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "addStep", null);
__decorate([
    Put(':id/steps/:stepId'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Param('stepId')),
    __param(3, Body(new ZodValidationPipe(UpdateStepSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "updateStep", null);
__decorate([
    Delete(':id/steps/:stepId'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Param('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "removeStep", null);
__decorate([
    Post(':id/transitions'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(CreateTransitionSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "addTransition", null);
__decorate([
    Delete(':id/transitions/:transitionId'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Param('transitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "removeTransition", null);
WorkflowsController = __decorate([
    Controller('workflows'),
    __metadata("design:paramtypes", [WorkflowsService])
], WorkflowsController);
export { WorkflowsController };
//# sourceMappingURL=workflows.controller.js.map