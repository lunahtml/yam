//backend/src/modules/gamification/achievements.controller.ts
import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { AchievementsService } from './services/achievements.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateAchievementSchema,
    CreateAchievementDto,
    GrantAchievementSchema,
    GrantAchievementDto,
} from './contracts/achievement.dto.js';

@Controller('achievements')
export class AchievementsController {
    constructor(private readonly service: AchievementsService) { }

    @Post('organization/:organizationId')
    async create(
        @CurrentUserId() userId: string,
        @Param('organizationId') organizationId: string,
        @Body(new ZodValidationPipe(CreateAchievementSchema))
        data: CreateAchievementDto,
    ) {
        return this.service.create(userId, organizationId, data);
    }

    @Get('organization/:organizationId')
    async list(
        @CurrentUserId() userId: string,
        @Param('organizationId') organizationId: string,
    ) {
        return this.service.listByOrganization(userId, organizationId);
    }

    @Get('user/:userId')
    async listByUser(
        @CurrentUserId() userId: string,
        @Param('userId') targetUserId: string,
    ) {
        return this.service.listByUser(userId, targetUserId);
    }

    @Post(':id/grant')
    async grant(
        @CurrentUserId() userId: string,
        @Param('id') achievementId: string,
        @Body(new ZodValidationPipe(GrantAchievementSchema))
        data: GrantAchievementDto,
    ) {
        return this.service.grantManual(userId, achievementId, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.service.remove(userId, id);
    }
}