//backend/src/modules/tags/tags.controller.ts
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
import { TagsService } from './services/tags.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateTagSchema,
    CreateTagDto,
    UpdateTagSchema,
    UpdateTagDto,
} from './contracts/create-tag.dto.js';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(CreateTagSchema)) data: CreateTagDto,
    ) {
        return this.tagsService.create(userId, data);
    }

    @Get('organization/:organizationId')
    async findByOrganization(
        @CurrentUserId() userId: string,
        @Param('organizationId') organizationId: string,
    ) {
        return this.tagsService.findByOrganization(userId, organizationId);
    }

    @Get('organization/:organizationId/search')
    async search(
        @CurrentUserId() userId: string,
        @Param('organizationId') organizationId: string,
        @Query('q') q: string,
    ) {
        if (!q || q.trim().length < 1) return [];
        return this.tagsService.search(userId, organizationId, q.trim());
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.tagsService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateTagSchema)) data: UpdateTagDto,
    ) {
        return this.tagsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.tagsService.remove(userId, id);
    }
}