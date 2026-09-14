//backend\src\common\pipes\zod-validation.pipe.ts
import { BadRequestException } from '@nestjs/common';
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
            throw new BadRequestException(error);
        }
    }
}
//# sourceMappingURL=zod-validation.pipe.js.map