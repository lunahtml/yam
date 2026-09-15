var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
//backend\src\common\filters\all-exceptions.filter.ts
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new Logger(AllExceptionsFilter_1.name);
    isProduction = process.env.NODE_ENV === 'production';
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';
        // Логируем полную ошибку внутри
        this.logger.error(`${request.method} ${request.url} — ${status}`, exception instanceof Error ? exception.stack : String(exception));
        // Наружу — только безопасное
        const body = typeof exceptionResponse === 'string'
            ? { statusCode: status, message: exceptionResponse }
            : {
                statusCode: status,
                ...exceptionResponse,
            };
        if (this.isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
            response.status(status).json({
                statusCode: status,
                message: 'Internal server error',
            });
            return;
        }
        response.status(status).json(body);
    }
};
AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    Catch()
], AllExceptionsFilter);
export { AllExceptionsFilter };
//# sourceMappingURL=all-exceptions.filter.js.map