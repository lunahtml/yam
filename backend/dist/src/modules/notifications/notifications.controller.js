var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
//backend\src\modules\notifications\notifications.controller.ts
import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async list(userId) {
        return this.notificationsService.findForUser(userId);
    }
    async unreadCount(userId) {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }
    async markAllRead(userId) {
        return this.notificationsService.markAllRead(userId);
    }
    async markRead(userId, id) {
        return this.notificationsService.markRead(userId, id);
    }
};
__decorate([
    Get(),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "list", null);
__decorate([
    Get('unread-count'),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "unreadCount", null);
__decorate([
    Patch('read-all'),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllRead", null);
__decorate([
    Patch(':id/read'),
    __param(0, CurrentUserId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markRead", null);
NotificationsController = __decorate([
    Controller('notifications'),
    __metadata("design:paramtypes", [NotificationsService])
], NotificationsController);
export { NotificationsController };
//# sourceMappingURL=notifications.controller.js.map