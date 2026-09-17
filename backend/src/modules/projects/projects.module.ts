//backend\src\modules\projects\projects.module.ts
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './services/projects.service.js';
import { UtmModule } from '../utm/utm.module.js';

@Module({
    imports: [UtmModule],
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule { }