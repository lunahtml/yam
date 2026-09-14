var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend\src\modules\sessions\sessions.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SessionsService } from './sessions.service.js';
import { SessionsController } from './sessions.controller.js';
let SessionsModule = class SessionsModule {
};
SessionsModule = __decorate([
    Module({
        imports: [
            JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
            }),
        ],
        controllers: [SessionsController],
        providers: [SessionsService],
        exports: [SessionsService],
    })
], SessionsModule);
export { SessionsModule };
//# sourceMappingURL=sessions.module.js.map