//backend\src\modules\utm\contracts\source.dto.ts
import { z } from 'zod';
export const CreateSourceSchema = z.object({
    name: z.string().min(1).max(50),
    label: z.string().min(1).max(100),
    icon: z.string().max(10).optional(),
});
export const UpdateSourceSchema = CreateSourceSchema.partial();
//# sourceMappingURL=source.dto.js.map