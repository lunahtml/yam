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
//backend/src/modules/comments/comments.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, } from '@nestjs/common';
import { CommentsService } from './services/comments.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateCommentSchema, UpdateCommentSchema, } from './contracts/comment.dto.js';
let CommentsController = class CommentsController {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async create(userId, recordId, data) {
        return this.commentsService.create(userId, recordId, data);
    }
    async findByRecord(userId, recordId) {
        return this.commentsService.findByRecord(userId, recordId);
    }
    async update(userId, id, data) {
        return this.commentsService.update(userId, id, data);
    }
    async remove(userId, id) {
        return this.commentsService.remove(userId, id);
    }
};
__decorate([
    Post('records/:recordId/comments'),
    __param(0, CurrentUserId()),
    __param(1, Param('recordId')),
    __param(2, Body(new ZodValidationPipe(CreateCommentSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "create", null);
__decorate([
    Get('records/:recordId/comments'),
    __param(0, CurrentUserId()),
    __param(1, Param('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findByRecord", null);
__decorate([
    Put('comments/:id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateCommentSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "update", null);
__decorate([
    Delete('comments/:id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "remove", null);
CommentsController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [CommentsService])
], CommentsController);
export { CommentsController };
//# sourceMappingURL=comments.controller.js.map