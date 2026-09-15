//backend/src/modules/workspaces/workspaces.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { WorkspacesService } from './services/workspaces.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateWorkspaceSchema,
    CreateWorkspaceDto,
    UpdateWorkspaceSchema,
    UpdateWorkspaceDto,
} from './contracts/create-workspace.dto.js';

@Controller('workspaces')
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(CreateWorkspaceSchema)) data: CreateWorkspaceDto,
    ) {
        return this.workspacesService.create(userId, data);
    }

    @Get('my')
    async listMy(@CurrentUserId() userId: string) {
        return this.workspacesService.listMyWorkspaces(userId);
    }

    @Get('organization/:organizationId')
    async listByOrganization(
        @CurrentUserId() userId: string,
        @Param('organizationId') organizationId: string,
    ) {
        return this.workspacesService.listByOrganization(userId, organizationId);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.workspacesService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateWorkspaceSchema)) data: UpdateWorkspaceDto,
    ) {
        return this.workspacesService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.workspacesService.remove(userId, id);
    }
}