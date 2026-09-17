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
//backend/src/modules/utm/mediums.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { MediumsService } from './services/mediums.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateMediumSchema, UpdateMediumSchema, } from './contracts/medium.dto.js';
let MediumsController = class MediumsController {
    mediumsService;
    constructor(mediumsService) {
        this.mediumsService = mediumsService;
    }
    async create(userId, projectId, data) {
        return this.mediumsService.create(userId, projectId, data);
    }
    async findByProject(userId, projectId) {
        return this.mediumsService.findByProject(userId, projectId);
    }
    async update(userId, id, data) {
        return this.mediumsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.mediumsService.remove(userId, id);
    }
};
__decorate([
    Post('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(CreateMediumSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MediumsController.prototype, "create", null);
__decorate([
    Get('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediumsController.prototype, "findByProject", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateMediumSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MediumsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediumsController.prototype, "remove", null);
MediumsController = __decorate([
    Controller('utm/mediums'),
    __metadata("design:paramtypes", [MediumsService])
], MediumsController);
export { MediumsController };
//# sourceMappingURL=mediums.controller.js.map