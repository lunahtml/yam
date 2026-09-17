var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend\src\modules\records\records.module.ts
import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller.js';
import { RecordsService } from './services/records.service.js';
import { RecordValidatorService } from './services/record-validator.service.js';
import { RecordIndexService } from './services/record-index.service.js';
let RecordsModule = class RecordsModule {
};
RecordsModule = __decorate([
    Module({
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
], RecordsModule);
export { RecordsModule };
//# sourceMappingURL=records.module.js.map