//backend\src\common\decorators\current-user-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../types/authenticated-user.type.js';

interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}

export const CurrentUserId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
        return request.user.userId;
    },
);