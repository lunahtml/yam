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
//backend/src/modules/organizations/organizations.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, } from '@nestjs/common';
import { OrganizationsService } from './services/organizations.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateOrganizationSchema, } from './contracts/create-organization.dto.js';
import { UpdateOrganizationSchema, } from './contracts/update-organization.dto.js';
let OrganizationsController = class OrganizationsController {
    organizationsService;
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    async create(userId, data) {
        return this.organizationsService.create(userId, data);
    }
    async listMy(userId) {
        return this.organizationsService.listMyOrganizations(userId);
    }
    async findById(userId, id) {
        return this.organizationsService.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.organizationsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.organizationsService.remove(userId, id);
    }
    async getMembers(userId, id, q, limit) {
        const parsedLimit = Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 50);
        return this.organizationsService.getMembers(userId, id, q, parsedLimit);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUserId()),
    __param(1, Body(new ZodValidationPipe(CreateOrganizationSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    Get('my'),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "listMy", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateOrganizationSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "remove", null);
__decorate([
    Get(':id/members'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Query('q')),
    __param(3, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getMembers", null);
OrganizationsController = __decorate([
    Controller('organizations'),
    __metadata("design:paramtypes", [OrganizationsService])
], OrganizationsController);
export { OrganizationsController };
//# sourceMappingURL=organizations.controller.js.map