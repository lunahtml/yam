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
//backend/src/modules/utm/links.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, } from '@nestjs/common';
import { LinksService } from './services/links.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateLinkSchema, UpdateLinkSchema, GenerateLinksSchema, } from './contracts/link.dto.js';
let LinksController = class LinksController {
    linksService;
    constructor(linksService) {
        this.linksService = linksService;
    }
    async create(userId, projectId, data) {
        return this.linksService.create(userId, projectId, data);
    }
    async generate(userId, projectId, data) {
        return this.linksService.generate(userId, projectId, data);
    }
    async findByProject(userId, projectId, campaignId, artifactId) {
        return this.linksService.findByProject(userId, projectId, {
            campaignId,
            artifactId,
        });
    }
    async update(userId, id, data) {
        return this.linksService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.linksService.remove(userId, id);
    }
};
__decorate([
    Post('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(CreateLinkSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "create", null);
__decorate([
    Post('project/:projectId/generate'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(GenerateLinksSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "generate", null);
__decorate([
    Get('project/:projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Query('campaignId')),
    __param(3, Query('artifactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "findByProject", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateLinkSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "remove", null);
LinksController = __decorate([
    Controller('utm/links'),
    __metadata("design:paramtypes", [LinksService])
], LinksController);
export { LinksController };
//# sourceMappingURL=links.controller.js.map