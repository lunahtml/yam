//backend\src\modules\marketing-dashboard\marketing-dashboard.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { MarketingDashboardService } from './services/marketing-dashboard.service.js';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateDashboardSchema,
    CreateDashboardDto,
    UpdateDashboardSchema,
    UpdateDashboardDto,
} from './contracts/create-dashboard.dto.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('marketing-dashboard')
@UseGuards(JwtAuthGuard)
export class MarketingDashboardController {
    constructor(private readonly service: MarketingDashboardService) { }

    @Post(':projectId')
    async create(
        @Req() req: AuthenticatedRequest,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateDashboardSchema)) data: CreateDashboardDto,
    ) {
        return this.service.create(req.user.userId, projectId, data);
    }

    @Put(':id')
    async update(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateDashboardSchema)) data: UpdateDashboardDto,
    ) {
        return this.service.update(req.user.userId, id, data);
    }

    @Get(':projectId')
    async get(
        @Req() req: AuthenticatedRequest,
        @Param('projectId') projectId: string,
    ) {
        return this.service.getByProject(req.user.userId, projectId);
    }
}