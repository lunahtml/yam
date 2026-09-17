//backend/src/modules/utm/rules.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { RulesService } from './services/rules.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateRuleSchema,
    CreateRuleDto,
    UpdateRuleSchema,
    UpdateRuleDto,
} from './contracts/rule.dto.js';

@Controller('utm/rules')
export class RulesController {
    constructor(private readonly rulesService: RulesService) { }

    @Post('project/:projectId')
    async create(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(CreateRuleSchema)) data: CreateRuleDto,
    ) {
        return this.rulesService.create(userId, projectId, data);
    }

    @Get('project/:projectId')
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.rulesService.findByProject(userId, projectId);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateRuleSchema)) data: UpdateRuleDto,
    ) {
        return this.rulesService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.rulesService.remove(userId, id);
    }
}