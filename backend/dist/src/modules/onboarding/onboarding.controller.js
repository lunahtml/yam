var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
//backend/src/modules/onboarding/onboarding.controller.ts
import { Controller, Post, HttpCode, HttpStatus, } from '@nestjs/common';
import { OnboardingService } from './services/onboarding.service.js';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
let OnboardingController = class OnboardingController {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async createDemo(userId) {
        return this.onboardingService.createDemo(userId);
    }
};
__decorate([
    Post('demo'),
    HttpCode(HttpStatus.CREATED),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "createDemo", null);
OnboardingController = __decorate([
    Controller('onboarding'),
    __metadata("design:paramtypes", [OnboardingService])
], OnboardingController);
export { OnboardingController };
//# sourceMappingURL=onboarding.controller.js.map