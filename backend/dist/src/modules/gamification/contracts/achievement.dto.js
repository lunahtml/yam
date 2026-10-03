//backend/src/modules/gamification/contracts/achievement.dto.ts
import { z } from 'zod';
export const CreateAchievementSchema = z.object({
    code: z.string().min(2).max(100),
    label: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    icon: z.string().max(10).optional(),
    xpReward: z.number().int().min(0).default(0),
    isAutomatic: z.boolean().default(false),
});
export const GrantAchievementSchema = z.object({
    userId: z.string().uuid(),
    note: z.string().max(1000).optional(),
});
//# sourceMappingURL=achievement.dto.js.map