//backend/src/modules/records/contracts/update-record.dto.ts
import { z } from 'zod';

const MAX_RECORD_DATA_BYTES = 50_000;

export const UpdateRecordSchema = z.object({
    data: z.record(z.string(), z.unknown())
        .refine(
            (data) => Buffer.byteLength(JSON.stringify(data), 'utf8') <= MAX_RECORD_DATA_BYTES,
            { message: `Record data exceeds maximum size of ${MAX_RECORD_DATA_BYTES} bytes` },
        )
        .optional(),
    sprintId: z.string().uuid().nullable().optional(),
});

export type UpdateRecordDto = z.infer<typeof UpdateRecordSchema>;