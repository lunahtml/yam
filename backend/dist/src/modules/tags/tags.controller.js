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
//backend/src/modules/tags/tags.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, } from '@nestjs/common';
import { TagsService } from './services/tags.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateTagSchema, UpdateTagSchema, } from './contracts/create-tag.dto.js';
let TagsController = class TagsController {
    tagsService;
    constructor(tagsService) {
        this.tagsService = tagsService;
    }
    async create(userId, data) {
        return this.tagsService.create(userId, data);
    }
    async findByOrganization(userId, organizationId) {
        return this.tagsService.findByOrganization(userId, organizationId);
    }
    async search(userId, organizationId, q) {
        if (!q || q.trim().length < 1)
            return [];
        return this.tagsService.search(userId, organizationId, q.trim());
    }
    async findById(userId, id) {
        return this.tagsService.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.tagsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.tagsService.remove(userId, id);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUserId()),
    __param(1, Body(new ZodValidationPipe(CreateTagSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "create", null);
__decorate([
    Get('organization/:organizationId'),
    __param(0, CurrentUserId()),
    __param(1, Param('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "findByOrganization", null);
__decorate([
    Get('organization/:organizationId/search'),
    __param(0, CurrentUserId()),
    __param(1, Param('organizationId')),
    __param(2, Query('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "search", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateTagSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "remove", null);
TagsController = __decorate([
    Controller('tags'),
    __metadata("design:paramtypes", [TagsService])
], TagsController);
export { TagsController };
//# sourceMappingURL=tags.controller.js.map