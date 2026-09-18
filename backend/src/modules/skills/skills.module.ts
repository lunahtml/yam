//backend\src\modules\skills\skills.module.ts
import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller.js';
import { UserSkillsController } from './user-skills.controller.js';
import { SkillsService } from './services/skills.service.js';
import { UserSkillsService } from './services/user-skills.service.js';

@Module({
    controllers: [SkillsController, UserSkillsController],
    providers: [SkillsService, UserSkillsService],
    exports: [SkillsService, UserSkillsService],
})
export class SkillsModule { }