//backend\src\common\pipes\zod-validation.pipe.ts
import { BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';
export class ZodValidationPipe {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    transform(value) {
        try {
            return this.schema.parse(value);
        }
        catch (error) {
            if (error instanceof ZodError) {
                const issues = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: issues,
                });
            }
            throw new BadRequestException('Validation failed');
        }
    }
}
//# sourceMappingURL=zod-validation.pipe.js.map