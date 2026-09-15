//backend\src\app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SessionsModule } from './modules/sessions/sessions.module.js';
import { MarketingDashboardModule } from './modules/marketing-dashboard/marketing-dashboard.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { MembershipModule } from './common/services/membership.module.js';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        SessionsModule,
        MarketingDashboardModule,
        ProjectsModule,
        MembershipModule,
    ],
})
export class AppModule { }