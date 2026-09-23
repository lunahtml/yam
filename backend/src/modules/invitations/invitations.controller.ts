//backend/src/modules/invitations/invitations.controller.ts
import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { InvitationsService } from './services/invitations.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateInvitationSchema,
    CreateInvitationDto,
} from './contracts/create-invitation.dto.js';

@Controller()
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Post('projects/:projectId/invitations')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateInvitationSchema))
        data: CreateInvitationDto,
    ) {
        return this.invitationsService.create(userId, projectId, data);
    }

    @Get('projects/:projectId/invitations')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.invitationsService.findByProject(userId, projectId);
    }

    @Public()
    @Get('invitations/:token')
    async findByToken(@Param('token') token: string) {
        return this.invitationsService.findByToken(token);
    }

    @Post('invitations/:token/accept')
    async accept(
        @CurrentUserId() userId: string,
        @Param('token') token: string,
    ) {
        return this.invitationsService.accept(userId, token);
    }

    @Delete('invitations/:id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.invitationsService.remove(userId, id);
    }
}