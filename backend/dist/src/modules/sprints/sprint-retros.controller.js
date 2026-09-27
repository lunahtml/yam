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
//backend/src/modules/sprints/sprint-retros.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SprintRetrosService } from './services/sprint-retros.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateRetroSchema, } from './contracts/sprint-retro.dto.js';
let SprintRetrosController = class SprintRetrosController {
    service;
    constructor(service) {
        this.service = service;
    }
    async upsert(userId, sprintId, data) {
        return this.service.upsert(userId, sprintId, data);
    }
    async findBySprint(userId, sprintId) {
        return this.service.findBySprint(userId, sprintId);
    }
    async getMy(userId, sprintId) {
        return this.service.getMy(userId, sprintId);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUserId()),
    __param(1, Param('sprintId')),
    __param(2, Body(new ZodValidationPipe(CreateRetroSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SprintRetrosController.prototype, "upsert", null);
__decorate([
    Get(),
    __param(0, CurrentUserId()),
    __param(1, Param('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SprintRetrosController.prototype, "findBySprint", null);
__decorate([
    Get('my'),
    __param(0, CurrentUserId()),
    __param(1, Param('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SprintRetrosController.prototype, "getMy", null);
SprintRetrosController = __decorate([
    Controller('sprints/:sprintId/retro'),
    __metadata("design:paramtypes", [SprintRetrosService])
], SprintRetrosController);
export { SprintRetrosController };
//# sourceMappingURL=sprint-retros.controller.js.map