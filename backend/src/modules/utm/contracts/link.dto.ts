//backend\src\modules\utm\contracts\link.dto.ts
import { z } from 'zod';

export const CreateLinkSchema = z.object({
    artifactId: z.string().cuid().optional(),
    campaignId: z.string().cuid().optional(),
    source: z.string().min(1).max(50),
    medium: z.string().min(1).max(50),
    campaign: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    baseUrl: z.string().url().max(2000),
    label: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
});

export type CreateLinkDto = z.infer<typeof CreateLinkSchema>;

export const UpdateLinkSchema = z.object({
    label: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
});

export type UpdateLinkDto = z.infer<typeof UpdateLinkSchema>;

// Автогенерация по правилу
export const GenerateLinksSchema = z.object({
    artifactId: z.string().cuid(),
    campaignId: z.string().cuid().optional(),
    baseUrl: z.string().url().max(2000),
    count: z.number().int().min(1).max(100).default(1),
    contentPrefix: z.string().max(50).optional(),
});

export type GenerateLinksDto = z.infer<typeof GenerateLinksSchema>;