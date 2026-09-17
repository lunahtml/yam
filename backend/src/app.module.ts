//backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './infra/prisma/prisma.module.js';
import { MembershipModule } from './common/services/membership.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { ArtifactsModule } from './modules/artifacts/artifacts.module.js';
import { UtmModule } from './modules/utm/utm.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SessionsModule } from './modules/sessions/sessions.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { WorkspacesModule } from './modules/workspaces/workspaces.module.js';
import { MarketingDashboardModule } from './modules/marketing-dashboard/marketing-dashboard.module.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([
            { name: 'default', ttl: 60000, limit: 60 },
            { name: 'auth', ttl: 60000, limit: 5 },
        ]),
        PrismaModule,
        MembershipModule,
        AuthModule,
        SessionsModule,
        ProjectsModule,
        WorkspacesModule,
        MarketingDashboardModule,
        OrganizationsModule,
        ArtifactsModule,
        UtmModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class AppModule { }