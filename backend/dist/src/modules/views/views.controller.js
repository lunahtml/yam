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
//backend/src/modules/views/views.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { ViewsService } from './services/views.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateViewSchema, } from './contracts/create-view.dto.js';
import { UpdateViewSchema, } from './contracts/update-view.dto.js';
let ViewsController = class ViewsController {
    viewsService;
    constructor(viewsService) {
        this.viewsService = viewsService;
    }
    async create(userId, data) {
        return this.viewsService.create(userId, data);
    }
    async findByEntity(userId, entityId) {
        return this.viewsService.findByEntity(userId, entityId);
    }
    async findById(userId, id) {
        return this.viewsService.findById(userId, id);
    }
    async update(userId, id, data) {
        return this.viewsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.viewsService.remove(userId, id);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUserId()),
    __param(1, Body(new ZodValidationPipe(CreateViewSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "create", null);
__decorate([
    Get('entity/:entityId'),
    __param(0, CurrentUserId()),
    __param(1, Param('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "findByEntity", null);
__decorate([
    Get(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "findById", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateViewSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "remove", null);
ViewsController = __decorate([
    Controller('views'),
    __metadata("design:paramtypes", [ViewsService])
], ViewsController);
export { ViewsController };
//# sourceMappingURL=views.controller.js.map