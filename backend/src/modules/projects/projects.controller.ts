//backend\src\modules\projects\projects.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './services/projects.service.js';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateProjectSchema,
    CreateProjectDto,
    UpdateProjectSchema,
    UpdateProjectDto,
} from './contracts/create-project.dto.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    async create(
        @Req() req: AuthenticatedRequest,
        @Body(new ZodValidationPipe(CreateProjectSchema)) data: CreateProjectDto,
    ) {
        return this.projectsService.create(req.user.userId, data);
    }

    @Get(':id')
    async findById(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.projectsService.findById(req.user.userId, id);
    }

    @Get('workspace/:workspaceId')
    async findByWorkspace(
        @Req() req: AuthenticatedRequest,
        @Param('workspaceId') workspaceId: string,
    ) {
        return this.projectsService.findByWorkspace(req.user.userId, workspaceId);
    }

    @Put(':id')
    async update(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateProjectSchema)) data: UpdateProjectDto,
    ) {
        return this.projectsService.update(req.user.userId, id, data);
    }

    @Put(':id/archive')
    async archive(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.projectsService.archive(req.user.userId, id);
    }

    @Delete(':id')
    async remove(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.projectsService.remove(req.user.userId, id);
    }
}