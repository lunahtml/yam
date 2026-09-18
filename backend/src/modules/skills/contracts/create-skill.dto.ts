//backend\src\modules\skills\contracts\create-skill.dto.ts
import { z } from 'zod';

export const SkillTypeSchema = z.enum(['HARD', 'SOFT']);

export const CreateSkillSchema = z.object({
    organizationId: z.string().uuid(),
    name: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/),
    label: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: SkillTypeSchema,
    categoryId: z.string().uuid().optional(),
});

export type CreateSkillDto = z.infer<typeof CreateSkillSchema>;

export const UpdateSkillSchema = CreateSkillSchema.partial().omit({
    organizationId: true,
    name: true,
});

export type UpdateSkillDto = z.infer<typeof UpdateSkillSchema>;