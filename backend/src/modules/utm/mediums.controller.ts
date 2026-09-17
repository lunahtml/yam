//backend/src/modules/utm/mediums.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { MediumsService } from './services/mediums.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateMediumSchema,
    CreateMediumDto,
    UpdateMediumSchema,
    UpdateMediumDto,
} from './contracts/medium.dto.js';

@Controller('utm/mediums')
export class MediumsController {
    constructor(private readonly mediumsService: MediumsService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateMediumSchema)) data: CreateMediumDto,
    ) {
        return this.mediumsService.create(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.mediumsService.findByProject(userId, projectId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateMediumSchema)) data: UpdateMediumDto,
    ) {
        return this.mediumsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.mediumsService.remove(userId, id);
    }
}