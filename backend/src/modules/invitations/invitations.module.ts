//backend\src\modules\invitations\invitations.module.ts
import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller.js';
import { InvitationsService } from './services/invitations.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [AuthModule],
    controllers: [InvitationsController],
    providers: [InvitationsService],
    exports: [InvitationsService],
})
export class InvitationsModule { }