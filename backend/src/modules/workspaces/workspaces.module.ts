//backend\src\modules\workspaces\workspaces.module.ts
import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './services/workspaces.service.js';

@Module({
    controllers: [WorkspacesController],
    providers: [WorkspacesService],
    exports: [WorkspacesService],
})
export class WorkspacesModule { }