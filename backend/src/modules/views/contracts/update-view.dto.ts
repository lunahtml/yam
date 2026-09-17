//backend\src\modules\views\contracts\update-view.dto.ts
import { z } from 'zod';

export const UpdateViewSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    isDefault: z.boolean().optional(),
});

export type UpdateViewDto = z.infer<typeof UpdateViewSchema>;