//backend/src/modules/artifacts/artifacts.controller.ts
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
import { ArtifactsService } from './services/artifacts.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateArtifactSchema,
    CreateArtifactDto,
    ArtifactTypeSchema,
} from './contracts/create-artifact.dto.js';
import {
    UpdateArtifactSchema,
    UpdateArtifactDto,
} from './contracts/update-artifact.dto.js';

@Controller('artifacts')
export class ArtifactsController {
    constructor(private readonly artifactsService: ArtifactsService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateArtifactSchema)) data: CreateArtifactDto,
    ) {
        return this.artifactsService.create(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Query('type') type?: string,
    ) {
        const parsedType = type ? ArtifactTypeSchema.parse(type) : undefined;
        return this.artifactsService.findByProject(userId, projectId, parsedType);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.artifactsService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateArtifactSchema)) data: UpdateArtifactDto,
    ) {
        return this.artifactsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.artifactsService.remove(userId, id);
    }
}