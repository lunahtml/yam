var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend/src/modules/gamification/gamification.module.ts
import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller.js';
import { AchievementsController } from './achievements.controller.js';
import { XpService } from './services/xp.service.js';
import { AchievementsService } from './services/achievements.service.js';
let GamificationModule = class GamificationModule {
};
GamificationModule = __decorate([
    Module({
        controllers: [GamificationController, AchievementsController],
        providers: [XpService, AchievementsService],
        exports: [XpService, AchievementsService],
    })
], GamificationModule);
export { GamificationModule };
//# sourceMappingURL=gamification.module.js.map