//backend\src\modules\entities\contracts\create-entity.dto.ts
import { z } from 'zod';
export const CreateEntitySchema = z.object({
    moduleId: z.string().uuid().optional(),
    name: z.string().min(1).max(50).regex(/^[a-z][a-z0-9_]*$/, {
        message: 'Name must be lowercase latin, starts with letter, can contain digits and underscores',
    }),
    label: z.string().min(2).max(200),
    icon: z.string().max(10).optional(),
    color: z.string().max(20).optional(),
});
//# sourceMappingURL=create-entity.dto.js.map