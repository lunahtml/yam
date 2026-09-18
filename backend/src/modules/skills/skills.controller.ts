//backend/src/modules/skills/skills.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { SkillsService } from './services/skills.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateSkillSchema,
    CreateSkillDto,
    UpdateSkillSchema,
    UpdateSkillDto,
} from './contracts/create-skill.dto.js';

@Controller('skills')
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(CreateSkillSchema)) data: CreateSkillDto,
    ) {
        return this.skillsService.create(userId, data);
    }

    @Get('organization/:organizationId')
    async findByOrganization(
        @CurrentUserId() userId: string,
        @Param('organizationId') organizationId: string,
    ) {
        return this.skillsService.findByOrganization(userId, organizationId);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.skillsService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateSkillSchema)) data: UpdateSkillDto,
    ) {
        return this.skillsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.skillsService.remove(userId, id);
    }
}