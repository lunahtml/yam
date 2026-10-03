//backend/src/modules/gamification/gamification.module.ts
import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller.js';
import { AchievementsController } from './achievements.controller.js';
import { XpService } from './services/xp.service.js';
import { AchievementsService } from './services/achievements.service.js';

@Module({
    controllers: [GamificationController, AchievementsController],
    providers: [XpService, AchievementsService],
    exports: [XpService, AchievementsService],
})
export class GamificationModule { }