//backend\src\modules\fields\contracts\update-field.dto.ts
import { z } from 'zod';

export const UpdateFieldSchema = z.object({
    label: z.string().min(2).max(200).optional(),
    options: z.record(z.string(), z.unknown()).optional(),
    isRequired: z.boolean().optional(),
    defaultValue: z.unknown().optional(),
});

export type UpdateFieldDto = z.infer<typeof UpdateFieldSchema>;