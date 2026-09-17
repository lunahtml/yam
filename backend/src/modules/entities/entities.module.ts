//backend\src\modules\entities\entities.module.ts
import { Module } from '@nestjs/common';
import { EntitiesController } from './entities.controller.js';
import { EntitiesService } from './services/entities.service.js';

@Module({
    controllers: [EntitiesController],
    providers: [EntitiesService],
    exports: [EntitiesService],
})
export class EntitiesModule { }