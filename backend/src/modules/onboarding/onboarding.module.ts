//backend/src/modules/onboarding/onboarding.module.ts
import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller.js';
import { OnboardingService } from './services/onboarding.service.js';
import { UtmModule } from '../utm/utm.module.js';

@Module({
    imports: [UtmModule],
    controllers: [OnboardingController],
    providers: [OnboardingService],
})
export class OnboardingModule { }