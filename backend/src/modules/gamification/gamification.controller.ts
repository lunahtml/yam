//backend/src/modules/gamification/gamification.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { XpService } from './services/xp.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';

@Controller('gamification')
export class GamificationController {
    constructor(private readonly xpService: XpService) { }

    @Get('xp/me')
    async getMyXp(@CurrentUserId() userId: string) {
        const [total, bySource, history] = await Promise.all([
            this.xpService.getTotalXp(userId),
            this.xpService.getBySource(userId),
            this.xpService.getHistory(userId, 50),
        ]);

        return { total, bySource, history };
    }

    @Get('xp/user/:userId')
    async getUserXp(@Param('userId') userId: string) {
        const [total, bySource] = await Promise.all([
            this.xpService.getTotalXp(userId),
            this.xpService.getBySource(userId),
        ]);

        return { total, bySource };
    }
}