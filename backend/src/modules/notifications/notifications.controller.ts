//backend\src\modules\notifications\notifications.controller.ts
import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async list(@CurrentUserId() userId: string) {
        return this.notificationsService.findForUser(userId);
    }

    @Get('unread-count')
    async unreadCount(@CurrentUserId() userId: string) {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }

    @Patch('read-all')
    async markAllRead(@CurrentUserId() userId: string) {
        return this.notificationsService.markAllRead(userId);
    }

    @Patch(':id/read')
    async markRead(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.notificationsService.markRead(userId, id);
    }
}