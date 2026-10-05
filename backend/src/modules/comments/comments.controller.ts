//backend/src/modules/comments/comments.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { CommentsService } from './services/comments.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateCommentSchema,
    CreateCommentDto,
    UpdateCommentSchema,
    UpdateCommentDto,
} from './contracts/comment.dto.js';

@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('records/:recordId/comments')
    async create(
        @CurrentUserId() userId: string,
        @Param('recordId') recordId: string,
        @Body(new ZodValidationPipe(CreateCommentSchema))
        data: CreateCommentDto,
    ) {
        return this.commentsService.create(userId, recordId, data);
    }

    @Get('records/:recordId/comments')
    async findByRecord(
        @CurrentUserId() userId: string,
        @Param('recordId') recordId: string,
    ) {
        return this.commentsService.findByRecord(userId, recordId);
    }

    @Put('comments/:id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateCommentSchema))
        data: UpdateCommentDto,
    ) {
        return this.commentsService.update(userId, id, data);
    }

    @Delete('comments/:id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.commentsService.remove(userId, id);
    }
}