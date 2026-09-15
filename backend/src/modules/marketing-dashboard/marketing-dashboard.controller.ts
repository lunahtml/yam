//backend/src/modules/marketing-dashboard/marketing-dashboard.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
} from '@nestjs/common';
import { MarketingDashboardService } from './services/marketing-dashboard.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateDashboardSchema,
    CreateDashboardDto,
    UpdateDashboardSchema,
    UpdateDashboardDto,
} from './contracts/create-dashboard.dto.js';

@Controller('marketing-dashboard')
export class MarketingDashboardController {
    constructor(private readonly service: MarketingDashboardService) { }

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

    @Get(':projectId')
    async get(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.service.getByProject(userId, projectId);
    }
}