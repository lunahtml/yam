//backend/src/modules/projects/projects.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { ProjectsService } from './services/projects.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateProjectSchema,
    CreateProjectDto,
    UpdateProjectSchema,
    UpdateProjectDto,
} from './contracts/create-project.dto.js';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(CreateProjectSchema)) data: CreateProjectDto,
    ) {
        return this.projectsService.create(userId, data);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.projectsService.findById(userId, id);
    }

    @Get('workspace/:workspaceId')
    async findByWorkspace(
        @CurrentUserId() userId: string,
        @Param('workspaceId') workspaceId: string,
    ) {
        return this.projectsService.findByWorkspace(userId, workspaceId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateProjectSchema)) data: UpdateProjectDto,
    ) {
        return this.projectsService.update(userId, id, data);
    }

    @Put(':id/archive')
    async archive(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.projectsService.archive(userId, id);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.projectsService.remove(userId, id);
    }
}