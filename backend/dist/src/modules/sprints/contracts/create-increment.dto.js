//backend\src\modules\sprints\contracts\create-increment.dto.ts
import { z } from 'zod';
export const CreateIncrementSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    icon: z.string().max(10).optional(),
    xp: z.number().int().min(0).default(0),
});
export const UpdateIncrementSchema = CreateIncrementSchema.partial();
//# sourceMappingURL=create-increment.dto.js.map