//backend/src/modules/sessions/sessions.controller.ts
import {
    Controller,
    Get,
    Delete,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionsService } from './sessions.service.js';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Get()
    async list(@Req() req: AuthenticatedRequest) {
        return this.sessionsService.listSessions(req.user.userId);
    }

    @Delete(':id')
    async revoke(
        @Req() req: AuthenticatedRequest,
        @Param('id') sessionId: string,
    ) {
        return this.sessionsService.revokeSession(req.user.userId, sessionId);
    }
}