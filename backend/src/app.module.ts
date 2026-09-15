//backend\src\app.module.ts
//backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './infra/prisma/prisma.module.js';
import { MembershipModule } from './common/services/membership.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SessionsModule } from './modules/sessions/sessions.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { MarketingDashboardModule } from './modules/marketing-dashboard/marketing-dashboard.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 60000,
                limit: 60,
            },
            {
                name: 'auth',
                ttl: 60000,
                limit: 5,
            },
        ]),
        PrismaModule,
        MembershipModule,
        AuthModule,
        SessionsModule,
        ProjectsModule,
        MarketingDashboardModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }