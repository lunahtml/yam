var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { UsersModule } from './modules/users/users.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { TagsModule } from './modules/tags/tags.module.js';
import { SkillsModule } from './modules/skills/skills.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            ThrottlerModule.forRoot([
                { name: 'default', ttl: 60000, limit: 600 }, // 600/мин для API
                { name: 'auth', ttl: 60000, limit: 10 }, // 10/мин для auth
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
            UsersModule,
            CategoriesModule,
            TagsModule,
            SkillsModule,
        ],
        providers: [
            { provide: APP_GUARD, useClass: ThrottlerGuard },
            { provide: APP_GUARD, useClass: JwtAuthGuard },
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map