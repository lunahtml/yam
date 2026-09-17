//backend\src\modules\records\contracts\update-record.dto.ts
import { z } from 'zod';
export const UpdateRecordSchema = z.object({
    data: z.record(z.string(), z.unknown()),
});
//# sourceMappingURL=update-record.dto.js.map