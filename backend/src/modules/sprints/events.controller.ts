//backend/src/modules/sprints/events.controller.ts
import {
    Controller,
    Post,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { EventsService } from './services/events.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateEventSchema,
    CreateEventDto,
} from './contracts/create-event.dto.js';

@Controller('sprints/:sprintId/events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Param('sprintId') sprintId: string,
        @Body(new ZodValidationPipe(CreateEventSchema)) data: CreateEventDto,
    ) {
        return this.eventsService.create(userId, sprintId, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.eventsService.remove(userId, id);
    }
}