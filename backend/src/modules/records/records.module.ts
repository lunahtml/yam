//backend\src\modules\records\records.module.ts
import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller.js';
import { RecordsService } from './services/records.service.js';
import { RecordValidatorService } from './services/record-validator.service.js';
import { RecordIndexService } from './services/record-index.service.js';

@Module({
    controllers: [RecordsController],
    providers: [
        RecordsService,
        RecordValidatorService,
        RecordIndexService,
    ],
    exports: [
        RecordsService,
        RecordValidatorService,
        RecordIndexService,
    ],
})
export class RecordsModule { }