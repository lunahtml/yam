//backend/src/modules/comments/contracts/comment.dto.ts
import { z } from 'zod';

export const CreateCommentSchema = z.object({
    body: z.string().min(1).max(5000),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema = z.object({
    body: z.string().min(1).max(5000),
});

export type UpdateCommentDto = z.infer<typeof UpdateCommentSchema>;