//backend/src/modules/sprints/increments.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { IncrementsService } from './services/increments.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateIncrementSchema,
    CreateIncrementDto,
    UpdateIncrementSchema,
    UpdateIncrementDto,
} from './contracts/create-increment.dto.js';

@Controller('increments')
export class IncrementsController {
    constructor(private readonly incrementsService: IncrementsService) { }

    @Post('sprint/:sprintId')
    async create(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
        @Body(new ZodValidationPipe(CreateIncrementSchema))
        data: CreateIncrementDto,
    ) {
        return this.incrementsService.create(userId, sprintId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.incrementsService.findByProject(userId, projectId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateIncrementSchema))
        data: UpdateIncrementDto,
    ) {
        return this.incrementsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.incrementsService.remove(userId, id);
    }
}