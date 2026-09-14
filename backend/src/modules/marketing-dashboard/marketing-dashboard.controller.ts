//backend\src\modules\marketing-dashboard\marketing-dashboard.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { MarketingDashboardService } from './services/marketing-dashboard.service.js';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateDashboardSchema,
    CreateDashboardDto,
    UpdateDashboardSchema,
    UpdateDashboardDto,
} from './contracts/create-dashboard.dto.js';

@Controller('marketing-dashboard')
@UseGuards(JwtAuthGuard)
export class MarketingDashboardController {
    constructor(private readonly service: MarketingDashboardService) { }

    @Post(':projectId')
    async create(
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateDashboardSchema)) data: CreateDashboardDto,
    ) {
        return this.service.create(projectId, data);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateDashboardSchema)) data: UpdateDashboardDto,
    ) {
        return this.service.update(id, data);
    }

    @Get(':projectId')
    async get(@Param('projectId') projectId: string) {
        return this.service.getByProject(projectId);
    }
}