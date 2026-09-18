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
import { EntitiesModule } from './modules/entities/entities.module.js';
import { FieldsModule } from './modules/fields/fields.module.js';
import { RecordsModule } from './modules/records/records.module.js';
import { ViewsModule } from './modules/views/views.module.js';
import { SprintsModule } from './modules/sprints/sprints.module.js';
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([
            { name: 'default', ttl: 60000, limit: 600 },   // 600/мин для API
            { name: 'auth', ttl: 60000, limit: 10 },        // 10/мин для auth
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
        EntitiesModule,
        FieldsModule,
        RecordsModule,
        ViewsModule,
        SprintsModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class AppModule { }