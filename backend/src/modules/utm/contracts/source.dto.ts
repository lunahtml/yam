//backend\src\modules\utm\contracts\source.dto.ts
import { z } from 'zod';

export const CreateSourceSchema = z.object({
    name: z.string().min(1).max(50),
    label: z.string().min(1).max(100),
    icon: z.string().max(10).optional(),
});

export type CreateSourceDto = z.infer<typeof CreateSourceSchema>;

export const UpdateSourceSchema = CreateSourceSchema.partial();
export type UpdateSourceDto = z.infer<typeof UpdateSourceSchema>;