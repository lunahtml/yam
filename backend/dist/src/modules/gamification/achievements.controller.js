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
//backend/src/modules/gamification/achievements.controller.ts
import { Controller, Get, Post, Delete, Body, Param, } from '@nestjs/common';
import { AchievementsService } from './services/achievements.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateAchievementSchema, GrantAchievementSchema, } from './contracts/achievement.dto.js';
let AchievementsController = class AchievementsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(userId, organizationId, data) {
        return this.service.create(userId, organizationId, data);
    }
    async list(userId, organizationId) {
        return this.service.listByOrganization(userId, organizationId);
    }
    async listByUser(userId, targetUserId) {
        return this.service.listByUser(userId, targetUserId);
    }
    async grant(userId, achievementId, data) {
        return this.service.grantManual(userId, achievementId, data);
    }
    async remove(userId, id) {
        return this.service.remove(userId, id);
    }
};
__decorate([
    Post('organization/:organizationId'),
    __param(0, CurrentUserId()),
    __param(1, Param('organizationId')),
    __param(2, Body(new ZodValidationPipe(CreateAchievementSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "create", null);
__decorate([
    Get('organization/:organizationId'),
    __param(0, CurrentUserId()),
    __param(1, Param('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "list", null);
__decorate([
    Get('user/:userId'),
    __param(0, CurrentUserId()),
    __param(1, Param('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "listByUser", null);
__decorate([
    Post(':id/grant'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(GrantAchievementSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "grant", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "remove", null);
AchievementsController = __decorate([
    Controller('achievements'),
    __metadata("design:paramtypes", [AchievementsService])
], AchievementsController);
export { AchievementsController };
//# sourceMappingURL=achievements.controller.js.map