//backend\src\modules\sprints\contracts\update-sprint.dto.ts
import { z } from 'zod';
import { SprintStatusSchema } from './create-sprint.dto.js';
export const UpdateSprintSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    goal: z.string().max(1000).optional(),
    description: z.string().max(2000).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: SprintStatusSchema.optional(),
    epicId: z.string().uuid().nullable().optional(),
});
//# sourceMappingURL=update-sprint.dto.js.map