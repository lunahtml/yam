var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend/src/modules/utm/utm.module.ts
//backend/src/modules/utm/utm.module.ts
import { Module } from '@nestjs/common';
import { SourcesService } from './services/sources.service.js';
import { MediumsService } from './services/mediums.service.js';
import { CampaignsService } from './services/campaigns.service.js';
import { RulesService } from './services/rules.service.js';
import { LinksService } from './services/links.service.js';
import { UrlBuilderService } from './services/url-builder.service.js';
import { UtmDefaultsService } from './services/defaults.service.js';
import { SourcesController } from './sources.controller.js';
import { MediumsController } from './mediums.controller.js';
import { CampaignsController } from './campaigns.controller.js';
import { RulesController } from './rules.controller.js';
import { LinksController } from './links.controller.js';
let UtmModule = class UtmModule {
};
UtmModule = __decorate([
    Module({
        controllers: [
            SourcesController,
            MediumsController,
            CampaignsController,
            RulesController,
            LinksController,
        ],
        providers: [
            SourcesService,
            MediumsService,
            CampaignsService,
            RulesService,
            LinksService,
            UrlBuilderService,
            UtmDefaultsService,
        ],
        exports: [
            SourcesService,
            MediumsService,
            CampaignsService,
            RulesService,
            LinksService,
            UrlBuilderService,
            UtmDefaultsService,
        ],
    })
], UtmModule);
export { UtmModule };
//# sourceMappingURL=utm.module.js.map