//backend/src/modules/entities/entities.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { EntitiesService } from './services/entities.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateEntitySchema,
    CreateEntityDto,
} from './contracts/create-entity.dto.js';
import {
    UpdateEntitySchema,
    UpdateEntityDto,
} from './contracts/update-entity.dto.js';
import { ENTITY_TEMPLATES } from './templates/entity-templates.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('entities')
export class EntitiesController {
    constructor(private readonly entitiesService: EntitiesService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateEntitySchema)) data: CreateEntityDto,
    ) {
        return this.entitiesService.create(userId, projectId, data);
    }

    @Get('templates')
    async getTemplates() {
        return ENTITY_TEMPLATES;
    }

    @Post('project/:projectId/from-template')
    async createFromTemplate(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body() data: { templateKey: string },
    ) {
        return this.entitiesService.createFromTemplate(
            userId,
            projectId,
            data.templateKey,
        );
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.entitiesService.findByProject(userId, projectId);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.entitiesService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateEntitySchema)) data: UpdateEntityDto,
    ) {
        return this.entitiesService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.entitiesService.remove(userId, id);
    }
}