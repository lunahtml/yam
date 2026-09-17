//backend/src/modules/records/records.controller.ts
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
import { RecordsService } from './services/records.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateRecordSchema,
    CreateRecordDto,
} from './contracts/create-record.dto.js';
import {
    UpdateRecordSchema,
    UpdateRecordDto,
} from './contracts/update-record.dto.js';
import {
    ListRecordsQuerySchema,
    ListRecordsQueryDto,
} from './contracts/list-records.dto.js';

@Controller('records')
export class RecordsController {
    constructor(private readonly recordsService: RecordsService) { }

    @Post('entity/:entityId')
    async create(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
        @Body(new ZodValidationPipe(CreateRecordSchema)) data: CreateRecordDto,
    ) {
        return this.recordsService.create(userId, entityId, data);
    }

    @Get('entity/:entityId')
    async findByEntity(
        @CurrentUserId() userId: string,
        @Param('entityId') entityId: string,
        @Query(new ZodValidationPipe(ListRecordsQuerySchema))
        query: ListRecordsQueryDto,
    ) {
        return this.recordsService.findByEntity(userId, entityId, query);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.recordsService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateRecordSchema)) data: UpdateRecordDto,
    ) {
        return this.recordsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.recordsService.remove(userId, id);
    }
}