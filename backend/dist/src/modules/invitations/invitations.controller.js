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
//backend/src/modules/invitations/invitations.controller.ts
import { Controller, Get, Post, Delete, Body, Param, } from '@nestjs/common';
import { InvitationsService } from './services/invitations.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateInvitationSchema, } from './contracts/create-invitation.dto.js';
let InvitationsController = class InvitationsController {
    invitationsService;
    constructor(invitationsService) {
        this.invitationsService = invitationsService;
    }
    async create(userId, projectId, data) {
        return this.invitationsService.create(userId, projectId, data);
    }
    async findByProject(userId, projectId) {
        return this.invitationsService.findByProject(userId, projectId);
    }
    async findByToken(token) {
        return this.invitationsService.findByToken(token);
    }
    async accept(userId, token) {
        return this.invitationsService.accept(userId, token);
    }
    async remove(userId, id) {
        return this.invitationsService.remove(userId, id);
    }
};
__decorate([
    Post('projects/:projectId/invitations'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(CreateInvitationSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "create", null);
__decorate([
    Get('projects/:projectId/invitations'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "findByProject", null);
__decorate([
    Public(),
    Get('invitations/:token'),
    __param(0, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "findByToken", null);
__decorate([
    Post('invitations/:token/accept'),
    __param(0, CurrentUserId()),
    __param(1, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "accept", null);
__decorate([
    Delete('invitations/:id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "remove", null);
InvitationsController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [InvitationsService])
], InvitationsController);
export { InvitationsController };
//# sourceMappingURL=invitations.controller.js.map