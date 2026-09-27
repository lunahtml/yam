//backend/src/modules/sprints/contracts/sprint-goal.dto.ts
import { z } from 'zod';
export const CreateSprintGoalSchema = z.object({
    text: z.string().min(2).max(500),
    description: z.string().max(2000).optional(),
});
export const UpdateSprintGoalSchema = z.object({
    text: z.string().min(2).max(500).optional(),
    description: z.string().max(2000).optional(),
    order: z.number().int().min(0).optional(),
});
//# sourceMappingURL=sprint-goal.dto.js.map