//backend\src\modules\fields\fields.module.ts
import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller.js';
import { FieldsService } from './services/fields.service.js';

@Module({
    controllers: [FieldsController],
    providers: [FieldsService],
    exports: [FieldsService],
})
export class FieldsModule { }