//backend\src\modules\artifacts\artifacts.module.ts
import { Module } from '@nestjs/common';
import { ArtifactsController } from './artifacts.controller.js';
import { ArtifactsService } from './services/artifacts.service.js';

@Module({
    controllers: [ArtifactsController],
    providers: [ArtifactsService],
    exports: [ArtifactsService],
})
export class ArtifactsModule { }