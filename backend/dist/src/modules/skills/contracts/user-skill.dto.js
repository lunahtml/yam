//backend\src\modules\skills\contracts\user-skill.dto.ts
import { z } from 'zod';
export const EvidenceTypeSchema = z.enum([
    'TASK_COMPLETED',
    'INTERNAL_EXAM',
    'EXTERNAL_EDUCATION',
    'IMPLEMENTATION',
    'HELPED_COLLEAGUE',
    'MANUAL_GRANT',
    'FACILITATION',
]);
export const AddEvidenceSchema = z.object({
    type: EvidenceTypeSchema,
    weight: z.number().int().min(1).max(10).default(1),
    comment: z.string().max(1000).optional(),
    sourceId: z.string().uuid().optional(),
    sourceType: z.string().max(50).optional(),
});
export const ManualLevelSchema = z.object({
    level: z.number().int().min(1).max(10),
    comment: z.string().max(1000).optional(),
});
//# sourceMappingURL=user-skill.dto.js.map