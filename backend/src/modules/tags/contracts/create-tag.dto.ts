//backend\src\modules\tags\contracts\create-tag.dto.ts
import { z } from 'zod';

export const CreateTagSchema = z.object({
    organizationId: z.string().uuid(),
    name: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/),
    label: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    icon: z.string().max(10).optional(),
    color: z.string().max(20).optional(),
    categoryId: z.string().uuid().optional(),
    skillId: z.string().uuid().optional(),
});

export type CreateTagDto = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = CreateTagSchema.partial().omit({
    organizationId: true,
    name: true,
});

export type UpdateTagDto = z.infer<typeof UpdateTagSchema>;