//backend/src/modules/skills/user-skills.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { UserSkillsService } from './services/user-skills.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    AddEvidenceSchema,
    AddEvidenceDto,
    ManualLevelSchema,
    ManualLevelDto,
} from './contracts/user-skill.dto.js';

@Controller('user-skills')
export class UserSkillsController {
    constructor(private readonly userSkillsService: UserSkillsService) { }

    @Get('user/:userId')
    async getUserSkills(
        @CurrentUserId() currentUserId: string,
        @Param('userId') userId: string,
    ) {
        return this.userSkillsService.getUserSkills(currentUserId, userId);
    }

    @Post(':id/evidence')
    async addEvidence(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(AddEvidenceSchema)) data: AddEvidenceDto,
    ) {
        return this.userSkillsService.addEvidence(userId, id, data);
    }

    @Put(':id/level')
    async setManualLevel(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(ManualLevelSchema)) data: ManualLevelDto,
    ) {
        return this.userSkillsService.setManualLevel(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.userSkillsService.deleteUserSkill(userId, id);
    }
}