//backend\src\modules\utm\contracts\medium.dto.ts
import { z } from 'zod';
export const CreateMediumSchema = z.object({
    name: z.string().min(1).max(50),
    label: z.string().min(1).max(100),
});
export const UpdateMediumSchema = CreateMediumSchema.partial();
//# sourceMappingURL=medium.dto.js.map