//backend/src/modules/sprints/epics.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { EpicsService } from './services/epics.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateEpicSchema,
    CreateEpicDto,
    UpdateEpicSchema,
    UpdateEpicDto,
} from './contracts/create-epic.dto.js';

@Controller('epics')
export class EpicsController {
    constructor(private readonly epicsService: EpicsService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateEpicSchema)) data: CreateEpicDto,
    ) {
        return this.epicsService.create(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.epicsService.findByProject(userId, projectId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateEpicSchema)) data: UpdateEpicDto,
    ) {
        return this.epicsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.epicsService.remove(userId, id);
    }
}