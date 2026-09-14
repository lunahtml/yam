//backend\src\modules\marketing-dashboard\marketing-dashboard.module.ts
import { Module } from '@nestjs/common';
import { MarketingDashboardController } from './marketing-dashboard.controller.js';
import { MarketingDashboardService } from './services/marketing-dashboard.service.js';

@Module({
    controllers: [MarketingDashboardController],
    providers: [MarketingDashboardService],
    exports: [MarketingDashboardService],
})
export class MarketingDashboardModule { }