//backend/src/modules/marketing-dashboard/marketing-dashboard.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MarketingDashboardService } from './services/marketing-dashboard.service.js';
import { ExcelExportService } from './services/excel-export.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateDashboardSchema,
    CreateDashboardDto,
} from './contracts/create-dashboard.dto.js';
import {
    UpdateDashboardSchema,
    UpdateDashboardDto,
} from './contracts/update-dashboard.dto.js';

@Controller('marketing-dashboard')
export class MarketingDashboardController {
    constructor(
        private readonly service: MarketingDashboardService,
        private readonly excel: ExcelExportService,
    ) { }

    @Post(':projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateDashboardSchema)) data: CreateDashboardDto,
    ) {
        return this.service.create(userId, projectId, data);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateDashboardSchema)) data: UpdateDashboardDto,
    ) {
        return this.service.update(userId, id, data);
    }

    @Get(':projectId/history')
    async history(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.service.listHistory(userId, projectId);
    }

    @Get(':id/export')
    async exportOne(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const { dashboard, projectName } = await this.service.exportDashboardExcel(
            userId,
            id,
            'Проект',
        );

        const buffer = await this.excel.exportDashboard(dashboard, projectName);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="dashboard-${id}.xlsx"`,
        );
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }

    @Get(':projectId/export-history')
    async exportHistory(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Res() res: Response,
    ) {
        const { dashboards, projectName } = await this.service.exportHistoryExcel(
            userId,
            projectId,
        );

        const buffer = await this.excel.exportHistory(dashboards, projectName);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="history-${projectId}.xlsx"`,
        );
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }

    @Get(':projectId')
    async get(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.service.getByProject(userId, projectId);
    }
}