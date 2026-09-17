//backend\src\modules\utm\contracts\medium.dto.ts
import { z } from 'zod';

export const CreateMediumSchema = z.object({
    name: z.string().min(1).max(50),
    label: z.string().min(1).max(100),
});

export type CreateMediumDto = z.infer<typeof CreateMediumSchema>;

export const UpdateMediumSchema = CreateMediumSchema.partial();
export type UpdateMediumDto = z.infer<typeof UpdateMediumSchema>;