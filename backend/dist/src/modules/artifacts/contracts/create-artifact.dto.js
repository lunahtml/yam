//backend\src\modules\artifacts\contracts\create-artifact.dto.ts
import { z } from 'zod';
export const ArtifactTypeSchema = z.enum([
    'WEBSITE',
    'SOCIAL',
    'DOCUMENT',
    'DASHBOARD',
    'VIDEO',
    'FILE',
    'OFFLINE',
    'CUSTOM',
]);
export const CreateArtifactSchema = z.object({
    type: ArtifactTypeSchema,
    name: z.string().min(2).max(200),
    url: z.string().url().max(1000).optional().or(z.literal('')),
    description: z.string().max(2000).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    isActive: z.boolean().default(true),
});
//# sourceMappingURL=create-artifact.dto.js.map