//backend/src/modules/utm/links.controller.ts
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
import { LinksService } from './services/links.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateLinkSchema,
    CreateLinkDto,
    UpdateLinkSchema,
    UpdateLinkDto,
    GenerateLinksSchema,
    GenerateLinksDto,
} from './contracts/link.dto.js';

@Controller('utm/links')
export class LinksController {
    constructor(private readonly linksService: LinksService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateLinkSchema)) data: CreateLinkDto,
    ) {
        return this.linksService.create(userId, projectId, data);
    }

    @Post('project/:projectId/generate')
    async generate(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(GenerateLinksSchema)) data: GenerateLinksDto,
    ) {
        return this.linksService.generate(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Query('campaignId') campaignId?: string,
        @Query('artifactId') artifactId?: string,
    ) {
        return this.linksService.findByProject(userId, projectId, {
            campaignId,
            artifactId,
        });
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateLinkSchema)) data: UpdateLinkDto,
    ) {
        return this.linksService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.linksService.remove(userId, id);
    }
}