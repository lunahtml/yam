//backend\src\modules\projects\projects.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './services/projects.service.js';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateProjectSchema,
    CreateProjectDto,
    UpdateProjectSchema,
    UpdateProjectDto,
} from './contracts/create-project.dto.js';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateProjectSchema)) data: CreateProjectDto,
    ) {
        return this.projectsService.create(data);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.projectsService.findById(id);
    }

    @Get('workspace/:workspaceId')
    async findByWorkspace(@Param('workspaceId') workspaceId: string) {
        return this.projectsService.findByWorkspace(workspaceId);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateProjectSchema)) data: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, data);
    }

    @Put(':id/archive')
    async archive(@Param('id') id: string) {
        return this.projectsService.archive(id);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }
}