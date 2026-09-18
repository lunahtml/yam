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
//backend/src/modules/skills/user-skills.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { UserSkillsService } from './services/user-skills.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AddEvidenceSchema, ManualLevelSchema, } from './contracts/user-skill.dto.js';
let UserSkillsController = class UserSkillsController {
    userSkillsService;
    constructor(userSkillsService) {
        this.userSkillsService = userSkillsService;
    }
    async getUserSkills(currentUserId, userId) {
        return this.userSkillsService.getUserSkills(currentUserId, userId);
    }
    async addEvidence(userId, id, data) {
        return this.userSkillsService.addEvidence(userId, id, data);
    }
    async setManualLevel(userId, id, data) {
        return this.userSkillsService.setManualLevel(userId, id, data);
    }
    async remove(userId, id) {
        return this.userSkillsService.deleteUserSkill(userId, id);
    }
};
__decorate([
    Get('user/:userId'),
    __param(0, CurrentUserId()),
    __param(1, Param('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserSkillsController.prototype, "getUserSkills", null);
__decorate([
    Post(':id/evidence'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(AddEvidenceSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserSkillsController.prototype, "addEvidence", null);
__decorate([
    Put(':id/level'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(ManualLevelSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserSkillsController.prototype, "setManualLevel", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserSkillsController.prototype, "remove", null);
UserSkillsController = __decorate([
    Controller('user-skills'),
    __metadata("design:paramtypes", [UserSkillsService])
], UserSkillsController);
export { UserSkillsController };
//# sourceMappingURL=user-skills.controller.js.map