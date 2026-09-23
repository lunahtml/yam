//backend/src/modules/members/members.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { MembersService } from './services/members.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    AddMemberSchema,
    AddMemberDto,
    UpdateMemberSchema,
    UpdateMemberDto,
} from './contracts/add-member.dto.js';

@Controller('projects/:projectId/members')
export class MembersController {
    constructor(private readonly membersService: MembersService) { }

    @Get()
    async findByProject(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.membersService.findByProject(userId, projectId);
    }

    @Post()
    async add(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(AddMemberSchema)) data: AddMemberDto,
    ) {
        return this.membersService.add(userId, projectId, data);
    }

    @Put(':memberId')
    async updateRole(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Param('memberId') memberId: string,
        @Body(new ZodValidationPipe(UpdateMemberSchema)) data: UpdateMemberDto,
    ) {
        return this.membersService.updateRole(userId, projectId, memberId, data);
    }

    @Delete(':memberId')
    async remove(
        @CurrentUserId() userId: string,
        @Param('projectId') projectId: string,
        @Param('memberId') memberId: string,
    ) {
        return this.membersService.remove(userId, projectId, memberId);
    }
}