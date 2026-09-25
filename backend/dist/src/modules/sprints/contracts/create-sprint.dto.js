//backend\src\modules\sprints\contracts\create-sprint.dto.ts
import { z } from 'zod';
export const SprintStatusSchema = z.enum([
    'PLANNED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
]);
export const CreateSprintSchema = z.object({
    name: z.string().min(2).max(200),
    goal: z.string().max(1000).optional(),
    description: z.string().max(2000).optional(),
    startDate: z.string(),
    endDate: z.string(),
    epicId: z.string().uuid().optional(),
});
//# sourceMappingURL=create-sprint.dto.js.map