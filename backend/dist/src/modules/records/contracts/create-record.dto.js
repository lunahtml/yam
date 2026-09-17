//backend\src\modules\records\contracts\create-record.dto.ts
import { z } from 'zod';
export const CreateRecordSchema = z.object({
    data: z.record(z.string(), z.unknown()),
});
//# sourceMappingURL=create-record.dto.js.map