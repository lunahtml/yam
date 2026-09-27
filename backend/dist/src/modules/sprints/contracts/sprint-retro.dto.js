//backend/src/modules/sprints/contracts/sprint-retro.dto.ts
import { z } from 'zod';
const RatingSchema = z.number().min(1).max(10).optional();
export const CreateRetroSchema = z.object({
    goalAchievement: RatingSchema,
    teamwork: RatingSchema,
    process: RatingSchema,
    quality: RatingSchema,
    speed: RatingSchema,
    overall: RatingSchema,
    wellDone: z.string().max(5000).optional(),
    improvements: z.string().max(5000).optional(),
    notes: z.string().max(5000).optional(),
});
export const UpdateRetroSchema = CreateRetroSchema;
//# sourceMappingURL=sprint-retro.dto.js.map