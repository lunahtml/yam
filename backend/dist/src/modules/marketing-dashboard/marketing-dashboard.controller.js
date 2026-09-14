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
//backend\src\modules\marketing-dashboard\marketing-dashboard.controller.ts
import { Controller, Get, Post, Put, Body, Param, UseGuards, } from '@nestjs/common';
import { MarketingDashboardService } from './services/marketing-dashboard.service.js';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateDashboardSchema, UpdateDashboardSchema, } from './contracts/create-dashboard.dto.js';
let MarketingDashboardController = class MarketingDashboardController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(projectId, data) {
        return this.service.create(projectId, data);
    }
    async update(id, data) {
        return this.service.update(id, data);
    }
    async get(projectId) {
        return this.service.getByProject(projectId);
    }
};
__decorate([
    Post(':projectId'),
    __param(0, Param('projectId')),
    __param(1, Body(new ZodValidationPipe(CreateDashboardSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "create", null);
__decorate([
    Put(':id'),
    __param(0, Param('id')),
    __param(1, Body(new ZodValidationPipe(UpdateDashboardSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "update", null);
__decorate([
    Get(':projectId'),
    __param(0, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "get", null);
MarketingDashboardController = __decorate([
    Controller('marketing-dashboard'),
    UseGuards(JwtAuthGuard),
    __metadata("design:paramtypes", [MarketingDashboardService])
], MarketingDashboardController);
export { MarketingDashboardController };
//# sourceMappingURL=marketing-dashboard.controller.js.map