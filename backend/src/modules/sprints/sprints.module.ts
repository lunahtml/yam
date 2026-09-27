//backend/src/modules/sprints/sprints.module.ts
import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller.js';
import { MetricsController } from './metrics.controller.js';
import { EventsController } from './events.controller.js';
import { IncrementsController } from './increments.controller.js';
import { EpicsController } from './epics.controller.js';
import { SprintGoalsController } from './sprint-goals.controller.js';
import { SprintRetrosController } from './sprint-retros.controller.js';
import { SprintsService } from './services/sprints.service.js';
import { MetricsService } from './services/metrics.service.js';
import { EventsService } from './services/events.service.js';
import { IncrementsService } from './services/increments.service.js';
import { EpicsService } from './services/epics.service.js';
import { SprintGoalsService } from './services/sprint-goals.service.js';
import { SprintRetrosService } from './services/sprint-retros.service.js';

@Module({
    controllers: [
        SprintsController,
        MetricsController,
        EventsController,
        IncrementsController,
        EpicsController,
        SprintGoalsController,
        SprintRetrosController,
    ],
    providers: [
        SprintsService,
        MetricsService,
        EventsService,
        IncrementsService,
        EpicsService,
        SprintGoalsService,
        SprintRetrosService,
    ],
    exports: [
        SprintsService,
        MetricsService,
        EventsService,
        IncrementsService,
        EpicsService,
        SprintGoalsService,
        SprintRetrosService,
    ],
})
export class SprintsModule { }