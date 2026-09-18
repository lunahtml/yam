//backend/src/modules/sprints/metrics.controller.ts
import {
    Controller,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { MetricsService } from './services/metrics.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateMetricSchema,
    CreateMetricDto,
    UpdateMetricSchema,
    UpdateMetricDto,
} from './contracts/create-metric.dto.js';

@Controller('sprints/:sprintId/metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
        @Body(new ZodValidationPipe(CreateMetricSchema)) data: CreateMetricDto,
    ) {
        return this.metricsService.create(userId, sprintId, data);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateMetricSchema)) data: UpdateMetricDto,
    ) {
        return this.metricsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.metricsService.remove(userId, id);
    }
}