//backend/src/modules/organizations/organizations.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { OrganizationsService } from './services/organizations.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateOrganizationSchema,
    CreateOrganizationDto,
} from './contracts/create-organization.dto.js';
import {
    UpdateOrganizationSchema,
    UpdateOrganizationDto,
} from './contracts/update-organization.dto.js';

@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(CreateOrganizationSchema))
        data: CreateOrganizationDto,
    ) {
        return this.organizationsService.create(userId, data);
    }

    @Get('my')
    async listMy(@CurrentUserId() userId: string) {
        return this.organizationsService.listMyOrganizations(userId);
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.organizationsService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateOrganizationSchema))
        data: UpdateOrganizationDto,
    ) {
        return this.organizationsService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.organizationsService.remove(userId, id);
    }
}