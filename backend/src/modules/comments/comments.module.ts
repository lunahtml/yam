//backend/src/modules/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './services/comments.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
    imports: [NotificationsModule],
    controllers: [CommentsController],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule { }