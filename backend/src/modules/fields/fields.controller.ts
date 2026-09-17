//backend/src/modules/fields/fields.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { FieldsService } from './services/fields.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateFieldSchema,
    CreateFieldDto,
} from './contracts/create-field.dto.js';
import {
    UpdateFieldSchema,
    UpdateFieldDto,
} from './contracts/update-field.dto.js';

@Controller('fields')
export class FieldsController {
    constructor(private readonly fieldsService: FieldsService) { }

    @Post('entity/:entityId')
    async create(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
        @Body(new ZodValidationPipe(CreateFieldSchema)) data: CreateFieldDto,
    ) {
        return this.fieldsService.create(userId, entityId, data);
    }

    @Get('entity/:entityId')
    async findByEntity(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
    ) {
        return this.fieldsService.findByEntity(userId, entityId);
    }

    @Get('entity/:entityId/types')
    async listTypes(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
    ) {
        return this.fieldsService.listTypes(userId, entityId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateFieldSchema)) data: UpdateFieldDto,
    ) {
        return this.fieldsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.fieldsService.remove(userId, id);
    }
}