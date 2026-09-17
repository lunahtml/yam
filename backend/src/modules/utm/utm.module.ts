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

@Module({
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
export class UtmModule { }