//backend/src/modules/sprints/sprint-retros.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SprintRetrosService } from './services/sprint-retros.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateRetroSchema,
    CreateRetroDto,
} from './contracts/sprint-retro.dto.js';

@Controller('sprints/:sprintId/retro')
export class SprintRetrosController {
    constructor(private readonly service: SprintRetrosService) { }

    @Post()
    async upsert(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
        @Body(new ZodValidationPipe(CreateRetroSchema)) data: CreateRetroDto,
    ) {
        return this.service.upsert(userId, sprintId, data);
    }

    @Get()
    async findBySprint(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
    ) {
        return this.service.findBySprint(userId, sprintId);
    }

    @Get('my')
    async getMy(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
    ) {
        return this.service.getMy(userId, sprintId);
    }
}