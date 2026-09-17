//backend\src\modules\views\contracts\create-view.dto.ts
import { z } from 'zod';

export const ViewTypeSchema = z.enum(['TABLE', 'KANBAN', 'CALENDAR', 'LIST']);

export const CreateViewSchema = z.object({
    entityId: z.string().uuid(),
    name: z.string().min(2).max(200),
    type: ViewTypeSchema.default('KANBAN'),
    config: z.record(z.string(), z.unknown()).optional(),
    isDefault: z.boolean().default(false),
});

export type CreateViewDto = z.infer<typeof CreateViewSchema>;