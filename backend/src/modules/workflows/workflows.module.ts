//backend/src/modules/workflows/workflows.module.ts
import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller.js';
import { WorkflowsService } from './services/workflows.service.js';

@Module({
    controllers: [WorkflowsController],
    providers: [WorkflowsService],
    exports: [WorkflowsService],
})
export class WorkflowsModule { }