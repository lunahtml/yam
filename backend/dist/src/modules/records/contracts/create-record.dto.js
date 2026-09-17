//backend\src\modules\records\contracts\create-record.dto.ts
// import { z } from 'zod';
// export const CreateRecordSchema = z.object({
//     data: z.record(z.string(), z.unknown()),
// });
// export type CreateRecordDto = z.infer<typeof CreateRecordSchema>;
import { z } from 'zod';
const MAX_RECORD_DATA_BYTES = 50_000; // 50kb на одну запись, подстройте под себя
export const CreateRecordSchema = z.object({
    data: z.record(z.string(), z.unknown())
        .refine((data) => Buffer.byteLength(JSON.stringify(data), 'utf8') <= MAX_RECORD_DATA_BYTES, { message: `Record data exceeds maximum size of ${MAX_RECORD_DATA_BYTES} bytes` }),
});
//# sourceMappingURL=create-record.dto.js.map