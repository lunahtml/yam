//backend\src\modules\views\views.module.ts
import { Module } from '@nestjs/common';
import { ViewsController } from './views.controller.js';
import { ViewsService } from './services/views.service.js';

@Module({
    controllers: [ViewsController],
    providers: [ViewsService],
    exports: [ViewsService],
})
export class ViewsModule { }