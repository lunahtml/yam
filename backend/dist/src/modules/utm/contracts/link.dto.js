//backend\src\modules\utm\contracts\link.dto.ts
import { z } from 'zod';
export const CreateLinkSchema = z.object({
    artifactId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    source: z.string().min(1).max(50),
    medium: z.string().min(1).max(50),
    campaign: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    baseUrl: z.string().url().max(2000),
    label: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
});
export const UpdateLinkSchema = z.object({
    label: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
});
// Автогенерация по правилу
export const GenerateLinksSchema = z.object({
    artifactId: z.string().uuid(),
    campaignId: z.string().uuid().optional(),
    baseUrl: z.string().url().max(2000),
    count: z.number().int().min(1).max(100).default(1),
    contentPrefix: z.string().max(50).optional(),
});
//# sourceMappingURL=link.dto.js.map