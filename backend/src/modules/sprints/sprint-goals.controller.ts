//backend/src/modules/sprints/sprint-goals.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { SprintGoalsService } from './services/sprint-goals.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateSprintGoalSchema,
    CreateSprintGoalDto,
    UpdateSprintGoalSchema,
    UpdateSprintGoalDto,
} from './contracts/sprint-goal.dto.js';

@Controller('sprints/:sprintId/goals')
export class SprintGoalsController {
    constructor(private readonly service: SprintGoalsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
        @Body(new ZodValidationPipe(CreateSprintGoalSchema))
        data: CreateSprintGoalDto,
    ) {
        return this.service.create(userId, sprintId, data);
    }

    @Get()
    async findBySprint(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
    ) {
        return this.service.findBySprint(userId, sprintId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateSprintGoalSchema))
        data: UpdateSprintGoalDto,
    ) {
        return this.service.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.service.remove(userId, id);
    }
}