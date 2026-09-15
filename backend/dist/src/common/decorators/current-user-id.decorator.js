//backend\src\common\decorators\current-user-id.decorator.ts
import { createParamDecorator } from '@nestjs/common';
export const CurrentUserId = createParamDecorator((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.userId;
});
//# sourceMappingURL=current-user-id.decorator.js.map