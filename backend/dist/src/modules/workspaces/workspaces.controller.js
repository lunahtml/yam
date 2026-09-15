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
//backend/src/modules/workspaces/workspaces.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { WorkspacesService } from './services/workspaces.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateWorkspaceSchema, UpdateWorkspaceSchema, } from './contracts/create-workspace.dto.js';
let WorkspacesController = class WorkspacesController {
    workspacesService;
    constructor(workspacesService) {
        this.workspacesService = workspacesService;
    }
    async create(userId, data) {
        return this.workspacesService.create(userId, data);
    }
    async listMy(userId) {
        return this.workspacesService.listMyWorkspaces(userId);
    }
    async listByOrganization(userId, organizationId) {
        return this.workspacesService.listByOrganization(userId, organizationId);
    }
    async findById(userId, id) {
        return this.workspacesService.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.workspacesService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.workspacesService.remove(userId, id);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUserId()),
    __param(1, Body(new ZodValidationPipe(CreateWorkspaceSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "create", null);
__decorate([
    Get('my'),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "listMy", null);
__decorate([
    Get('organization/:organizationId'),
    __param(0, CurrentUserId()),
    __param(1, Param('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "listByOrganization", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateWorkspaceSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "remove", null);
WorkspacesController = __decorate([
    Controller('workspaces'),
    __metadata("design:paramtypes", [WorkspacesService])
], WorkspacesController);
export { WorkspacesController };
//# sourceMappingURL=workspaces.controller.js.map