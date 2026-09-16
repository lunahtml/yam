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
//backend/src/modules/marketing-dashboard/marketing-dashboard.controller.ts
import { Controller, Get, Post, Put, Body, Param, Res, } from '@nestjs/common';
import { MarketingDashboardService } from './services/marketing-dashboard.service.js';
import { ExcelExportService } from './services/excel-export.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateDashboardSchema, } from './contracts/create-dashboard.dto.js';
import { UpdateDashboardSchema, } from './contracts/update-dashboard.dto.js';
let MarketingDashboardController = class MarketingDashboardController {
    service;
    excel;
    constructor(service, excel) {
        this.service = service;
        this.excel = excel;
    }
    async create(userId, projectId, data) {
        return this.service.create(userId, projectId, data);
    }
    async update(userId, id, data) {
        return this.service.update(userId, id, data);
    }
    async history(userId, projectId) {
        return this.service.listHistory(userId, projectId);
    }
    async exportOne(userId, id, res) {
        const { dashboard, projectName } = await this.service.exportDashboardExcel(userId, id, 'Проект');
        const buffer = await this.excel.exportDashboard(dashboard, projectName);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="dashboard-${id}.xlsx"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }
    async exportHistory(userId, projectId, res) {
        const { dashboards, projectName } = await this.service.exportHistoryExcel(userId, projectId);
        const buffer = await this.excel.exportHistory(dashboards, projectName);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="history-${projectId}.xlsx"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }
    async get(userId, projectId) {
        return this.service.getByProject(userId, projectId);
    }
};
__decorate([
    Post(':projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Body(new ZodValidationPipe(CreateDashboardSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "create", null);
__decorate([
    Put(':id'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Body(new ZodValidationPipe(UpdateDashboardSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "update", null);
__decorate([
    Get(':projectId/history'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "history", null);
__decorate([
    Get(':id/export'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __param(2, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "exportOne", null);
__decorate([
    Get(':projectId/export-history'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __param(2, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "exportHistory", null);
__decorate([
    Get(':projectId'),
    __param(0, CurrentUserId()),
    __param(1, Param('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketingDashboardController.prototype, "get", null);
MarketingDashboardController = __decorate([
    Controller('marketing-dashboard'),
    __metadata("design:paramtypes", [MarketingDashboardService,
        ExcelExportService])
], MarketingDashboardController);
export { MarketingDashboardController };
//# sourceMappingURL=marketing-dashboard.controller.js.map