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
//backend/src/modules/artifacts/artifacts.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, } from '@nestjs/common';
import { ArtifactsService } from './services/artifacts.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateArtifactSchema, ArtifactTypeSchema, } from './contracts/create-artifact.dto.js';
import { UpdateArtifactSchema, } from './contracts/update-artifact.dto.js';
let ArtifactsController = class ArtifactsController {
    artifactsService;
    constructor(artifactsService) {
        this.artifactsService = artifactsService;
    }
    async create(userId, projectId, data) {
        return this.artifactsService.create(userId, projectId, data);
    }
    async findByProject(userId, projectId, type) {
        const parsedType = type ? ArtifactTypeSchema.parse(type) : undefined;
        return this.artifactsService.findByProject(userId, projectId, parsedType);
    }
    async findById(userId, id) {
        return this.artifactsService.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.artifactsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.artifactsService.remove(userId, id);
    }
};
__decorate([
    Post('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(CreateArtifactSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ArtifactsController.prototype, "create", null);
__decorate([
    Get('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Query('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ArtifactsController.prototype, "findByProject", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ArtifactsController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateArtifactSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ArtifactsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ArtifactsController.prototype, "remove", null);
ArtifactsController = __decorate([
    Controller('artifacts'),
    __metadata("design:paramtypes", [ArtifactsService])
], ArtifactsController);
export { ArtifactsController };
//# sourceMappingURL=artifacts.controller.js.map