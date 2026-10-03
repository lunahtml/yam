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
//backend/src/modules/gamification/gamification.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { XpService } from './services/xp.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
let GamificationController = class GamificationController {
    xpService;
    constructor(xpService) {
        this.xpService = xpService;
    }
    async getMyXp(userId) {
        const [total, bySource, history] = await Promise.all([
            this.xpService.getTotalXp(userId),
            this.xpService.getBySource(userId),
            this.xpService.getHistory(userId, 50),
        ]);
        return { total, bySource, history };
    }
    async getUserXp(userId) {
        const [total, bySource] = await Promise.all([
            this.xpService.getTotalXp(userId),
            this.xpService.getBySource(userId),
        ]);
        return { total, bySource };
    }
};
__decorate([
    Get('xp/me'),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getMyXp", null);
__decorate([
    Get('xp/user/:userId'),
    __param(0, Param('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getUserXp", null);
GamificationController = __decorate([
    Controller('gamification'),
    __metadata("design:paramtypes", [XpService])
], GamificationController);
export { GamificationController };
//# sourceMappingURL=gamification.controller.js.map