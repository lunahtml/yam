//backend/src/modules/categories/categories.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { CategoriesService } from './services/categories.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    CreateCategorySchema,
    CreateCategoryDto,
    UpdateCategorySchema,
    UpdateCategoryDto,
} from './contracts/create-category.dto.js';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    async create(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(CreateCategorySchema)) data: CreateCategoryDto,
    ) {
        return this.categoriesService.create(userId, data);
    }

    @Get('organization/:organizationId')
    async findByOrganization(
        @CurrentUserId() userId: string,
        @Param('organizationId') organizationId: string,
        @Query('scope') scope?: string,
    ) {
        return this.categoriesService.findByOrganization(
            userId,
            organizationId,
            scope,
        );
    }

    @Get(':id')
    async findById(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.categoriesService.findById(userId, id);
    }

    @Put(':id')
    async update(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdateCategorySchema)) data: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(userId, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.categoriesService.remove(userId, id);
    }
}