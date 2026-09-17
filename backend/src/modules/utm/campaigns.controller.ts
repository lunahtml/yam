//backend/src/modules/utm/campaigns.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { CampaignsService } from './services/campaigns.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateCampaignSchema,
    CreateCampaignDto,
    UpdateCampaignSchema,
    UpdateCampaignDto,
} from './contracts/campaign.dto.js';

@Controller('utm/campaigns')
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateCampaignSchema)) data: CreateCampaignDto,
    ) {
        return this.campaignsService.create(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.campaignsService.findByProject(userId, projectId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateCampaignSchema)) data: UpdateCampaignDto,
    ) {
        return this.campaignsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.campaignsService.remove(userId, id);
    }
}