//backend\src\modules\records\contracts\create-record.dto.ts
import { z } from 'zod';

export const CreateRecordSchema = z.object({
    data: z.record(z.string(), z.unknown()),
});

export type CreateRecordDto = z.infer<typeof CreateRecordSchema>;