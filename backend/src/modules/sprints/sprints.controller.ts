//backend/src/modules/sprints/sprints.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { SprintsService } from './services/sprints.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateSprintSchema,
    CreateSprintDto,
} from './contracts/create-sprint.dto.js';
import {
    UpdateSprintSchema,
    UpdateSprintDto,
} from './contracts/update-sprint.dto.js';

@Controller('sprints')
export class SprintsController {
    constructor(private readonly sprintsService: SprintsService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateSprintSchema)) data: CreateSprintDto,
    ) {
        return this.sprintsService.create(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.sprintsService.findByProject(userId, projectId);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.sprintsService.findById(userId, id);
    }
    @Get(':id/records')
    async findRecords(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.sprintsService.findRecords(userId, id);
    }
    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateSprintSchema)) data: UpdateSprintDto,
    ) {
        return this.sprintsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.sprintsService.remove(userId, id);
    }
}