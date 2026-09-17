//backend/src/modules/views/views.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { ViewsService } from './services/views.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateViewSchema,
    CreateViewDto,
} from './contracts/create-view.dto.js';
import {
    UpdateViewSchema,
    UpdateViewDto,
} from './contracts/update-view.dto.js';

@Controller('views')
export class ViewsController {
    constructor(private readonly viewsService: ViewsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(CreateViewSchema)) data: CreateViewDto,
    ) {
        return this.viewsService.create(userId, data);
    }

    @Get('entity/:entityId')
    async findByEntity(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
    ) {
        return this.viewsService.findByEntity(userId, entityId);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.viewsService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateViewSchema)) data: UpdateViewDto,
    ) {
        return this.viewsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.viewsService.remove(userId, id);
    }
}