//backend/src/modules/workflows/workflows.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { WorkflowsService } from './services/workflows.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateWorkflowSchema,
    CreateWorkflowDto,
    UpdateWorkflowSchema,
    UpdateWorkflowDto,
    CreateStepSchema,
    CreateStepDto,
    UpdateStepSchema,
    UpdateStepDto,
    CreateTransitionSchema,
    CreateTransitionDto,
    UpdateTransitionSchema,
    UpdateTransitionDto,
} from './contracts/workflow.dto.js';

@Controller('workflows')
export class WorkflowsController {
    constructor(private readonly service: WorkflowsService) { }

    // ═══ WORKFLOW ═══

    @Post('project/:projectId/entity/:entityId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Param('entityId') entityId: string,
        @Body(new ZodValidationPipe(CreateWorkflowSchema))
        data: CreateWorkflowDto,
    ) {
        return this.service.create(userId, projectId, entityId, data);
    }

    @Get('entity/:entityId')
    async findByEntity(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
    ) {
        return this.service.findByEntity(userId, entityId);
    }

    @Get('entity/:entityId/active')
    async findActiveForEntity(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
    ) {
        return this.service.findActiveForEntity(userId, entityId);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.service.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateWorkflowSchema))
        data: UpdateWorkflowDto,
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

    @Get(':id/can-transition')
    async canTransition(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        await this.service.findById(userId, id);
        return this.service.canTransition(id, from, to);
    }

    // ═══ STEPS ═══

    @Post(':id/steps')
    async addStep(
        @CurrentUserId() userId: string,
        @Param('id') workflowId: string,
        @Body(new ZodValidationPipe(CreateStepSchema))
        data: CreateStepDto,
    ) {
        return this.service.addStep(userId, workflowId, data);
    }

    @Put(':id/steps/:stepId')
    async updateStep(
        @CurrentUserId() userId: string,
        @Param('id') workflowId: string,
        @Param('stepId') stepId: string,
        @Body(new ZodValidationPipe(UpdateStepSchema))
        data: UpdateStepDto,
    ) {
        return this.service.updateStep(userId, workflowId, stepId, data);
    }

    @Delete(':id/steps/:stepId')
    async removeStep(
        @CurrentUserId() userId: string,
        @Param('id') workflowId: string,
        @Param('stepId') stepId: string,
    ) {
        return this.service.removeStep(userId, workflowId, stepId);
    }

    // ═══ TRANSITIONS ═══

    @Post(':id/transitions')
    async addTransition(
        @CurrentUserId() userId: string,
        @Param('id') workflowId: string,
        @Body(new ZodValidationPipe(CreateTransitionSchema))
        data: CreateTransitionDto,
    ) {
        return this.service.addTransition(userId, workflowId, data);
    }

    @Put(':id/transitions/:transitionId')
    async updateTransition(
        @CurrentUserId() userId: string,
        @Param('id') workflowId: string,
        @Param('transitionId') transitionId: string,
        @Body(new ZodValidationPipe(UpdateTransitionSchema))
        data: UpdateTransitionDto,
    ) {
        return this.service.updateTransition(userId, workflowId, transitionId, data);
    }

    @Delete(':id/transitions/:transitionId')
    async removeTransition(
        @CurrentUserId() userId: string,
        @Param('id') workflowId: string,
        @Param('transitionId') transitionId: string,
    ) {
        return this.service.removeTransition(userId, workflowId, transitionId);
    }
}