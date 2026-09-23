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
//backend/src/modules/members/members.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { MembersService } from './services/members.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AddMemberSchema, UpdateMemberSchema, } from './contracts/add-member.dto.js';
let MembersController = class MembersController {
    membersService;
    constructor(membersService) {
        this.membersService = membersService;
    }
    async findByProject(userId, projectId) {
        return this.membersService.findByProject(userId, projectId);
    }
    async add(userId, projectId, data) {
        return this.membersService.add(userId, projectId, data);
    }
    async updateRole(userId, projectId, memberId, data) {
        return this.membersService.updateRole(userId, projectId, memberId, data);
    }
    async remove(userId, projectId, memberId) {
        return this.membersService.remove(userId, projectId, memberId);
    }
};
__decorate([
    Get(),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "findByProject", null);
__decorate([
    Post(),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(AddMemberSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "add", null);
__decorate([
    Put(':memberId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Param('memberId')),
    __param(3, Body(new ZodValidationPipe(UpdateMemberSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "updateRole", null);
__decorate([
    Delete(':memberId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Param('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "remove", null);
MembersController = __decorate([
    Controller('projects/:projectId/members'),
    __metadata("design:paramtypes", [MembersService])
], MembersController);
export { MembersController };
//# sourceMappingURL=members.controller.js.map