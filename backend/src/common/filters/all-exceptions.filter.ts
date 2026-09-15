//backend\src\common\filters\all-exceptions.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
    private readonly isProduction = process.env.NODE_ENV === 'production';

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        // Логируем полную ошибку внутри
        this.logger.error(
            `${request.method} ${request.url} — ${status}`,
            exception instanceof Error ? exception.stack : String(exception),
        );

        // Наружу — только безопасное
        const body =
            typeof exceptionResponse === 'string'
                ? { statusCode: status, message: exceptionResponse }
                : {
                    statusCode: status,
                    ...(exceptionResponse as Record<string, unknown>),
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
}