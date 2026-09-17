//backend/src/modules/utm/sources.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { SourcesService } from './services/sources.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateSourceSchema,
    CreateSourceDto,
    UpdateSourceSchema,
    UpdateSourceDto,
} from './contracts/source.dto.js';

@Controller('utm/sources')
export class SourcesController {
    constructor(private readonly sourcesService: SourcesService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateSourceSchema)) data: CreateSourceDto,
    ) {
        return this.sourcesService.create(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.sourcesService.findByProject(userId, projectId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateSourceSchema)) data: UpdateSourceDto,
    ) {
        return this.sourcesService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.sourcesService.remove(userId, id);
    }
}