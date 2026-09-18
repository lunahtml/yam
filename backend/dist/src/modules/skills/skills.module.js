var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend\src\modules\skills\skills.module.ts
import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller.js';
import { UserSkillsController } from './user-skills.controller.js';
import { SkillsService } from './services/skills.service.js';
import { UserSkillsService } from './services/user-skills.service.js';
let SkillsModule = class SkillsModule {
};
SkillsModule = __decorate([
    Module({
        controllers: [SkillsController, UserSkillsController],
        providers: [SkillsService, UserSkillsService],
        exports: [SkillsService, UserSkillsService],
    })
], SkillsModule);
export { SkillsModule };
//# sourceMappingURL=skills.module.js.map