//backend\src\modules\categories\contracts\create-category.dto.ts
import { z } from 'zod';

export const CategoryScopeSchema = z.enum([
    'PROJECT',
    'TASK',
    'TAG',
    'SKILL',
]);

export const CreateCategorySchema = z.object({
    organizationId: z.string().uuid(),
    parentId: z.string().uuid().optional(),
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    description: z.string().max(1000).optional(),
    icon: z.string().max(10).optional(),
    color: z.string().max(20).optional(),
    scope: CategoryScopeSchema,
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial().omit({
    organizationId: true,
    scope: true,
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;