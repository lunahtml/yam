//backend/src/modules/users/users.controller.ts
import {
    Controller,
    Get,
    Patch,
    Query,
    Param,
    Body,
} from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    UpdateUserSchema,
    UpdateUserDto,
} from './contracts/update-user.dto.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getMe(@CurrentUserId() userId: string) {
        return this.usersService.getMe(userId);
    }

    @Patch('me')
    async updateMe(
        @CurrentUserId() userId: string,
        @Body(new ZodValidationPipe(UpdateUserSchema)) data: UpdateUserDto,
    ) {
        return this.usersService.updateMe(userId, data);
    }

    @Get('search')
    async search(
        @Query('q') q: string,
        @Query('limit') limit?: string,
    ) {
        if (!q || q.trim().length < 1) return [];
        return this.usersService.search(q.trim(), limit ? Number(limit) : 20);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }
}