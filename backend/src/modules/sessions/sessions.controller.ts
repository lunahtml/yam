//backend/src/modules/sessions/sessions.controller.ts
import { Controller, Get, Delete, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Get()
    async list(@CurrentUserId() userId: string) {
        return this.sessionsService.listSessions(userId);
    }

    @Delete(':id')
    async revoke(
        @CurrentUserId() userId: string,
        @Param('id') sessionId: string,
    ) {
        return this.sessionsService.revokeSession(userId, sessionId);
    }
}