//backend/src/modules/onboarding/onboarding.controller.ts
import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { OnboardingService } from './services/onboarding.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';

@Controller('onboarding')
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) { }

    @Post('demo')
    @HttpCode(HttpStatus.CREATED)
    async createDemo(@CurrentUserId() userId: string) {
        return this.onboardingService.createDemo(userId);
    }
}