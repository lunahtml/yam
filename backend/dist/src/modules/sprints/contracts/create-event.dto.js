//backend\src\modules\sprints\contracts\create-event.dto.ts
import { z } from 'zod';
export const SprintEventTypeSchema = z.enum([
    'SUCCESS',
    'PARTIAL_SUCCESS',
    'FAILURE',
    'PIVOT',
    'PAUSE',
    'BREAKTHROUGH',
]);
export const CreateEventSchema = z.object({
    type: SprintEventTypeSchema,
    title: z.string().min(2).max(200),
    body: z.string().max(5000).optional(),
    xp: z.number().int().min(0).default(0),
});
//# sourceMappingURL=create-event.dto.js.map