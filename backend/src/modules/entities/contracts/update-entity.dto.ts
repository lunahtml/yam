//backend\src\modules\entities\contracts\update-entity.dto.ts
import { z } from 'zod';

export const UpdateEntitySchema = z.object({
    label: z.string().min(2).max(200).optional(),
    icon: z.string().max(10).optional(),
    color: z.string().max(20).optional(),
});

export type UpdateEntityDto = z.infer<typeof UpdateEntitySchema>;