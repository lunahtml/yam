//backend\src\modules\sprints\contracts\create-epic.dto.ts
import { z } from 'zod';

export const EpicStatusSchema = z.enum([
    'OPEN',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED',
]);

export const CreateEpicSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    color: z.string().max(20).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export type CreateEpicDto = z.infer<typeof CreateEpicSchema>;

export const UpdateEpicSchema = CreateEpicSchema.partial().extend({
    status: EpicStatusSchema.optional(),
});

export type UpdateEpicDto = z.infer<typeof UpdateEpicSchema>;