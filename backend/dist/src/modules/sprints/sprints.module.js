var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend\src\modules\sprints\sprints.module.ts
import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller.js';
import { MetricsController } from './metrics.controller.js';
import { EventsController } from './events.controller.js';
import { IncrementsController } from './increments.controller.js';
import { EpicsController } from './epics.controller.js';
import { SprintsService } from './services/sprints.service.js';
import { MetricsService } from './services/metrics.service.js';
import { EventsService } from './services/events.service.js';
import { IncrementsService } from './services/increments.service.js';
import { EpicsService } from './services/epics.service.js';
let SprintsModule = class SprintsModule {
};
SprintsModule = __decorate([
    Module({
        controllers: [
            SprintsController,
            MetricsController,
            EventsController,
            IncrementsController,
            EpicsController,
        ],
        providers: [
            SprintsService,
            MetricsService,
            EventsService,
            IncrementsService,
            EpicsService,
        ],
        exports: [
            SprintsService,
            MetricsService,
            EventsService,
            IncrementsService,
            EpicsService,
        ],
    })
], SprintsModule);
export { SprintsModule };
//# sourceMappingURL=sprints.module.js.map