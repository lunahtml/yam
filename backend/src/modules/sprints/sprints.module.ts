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

@Module({
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
export class SprintsModule { }