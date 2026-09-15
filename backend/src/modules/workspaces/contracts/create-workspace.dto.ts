//backend\src\modules\workspaces\contracts\create-workspace.dto.ts
import { z } from 'zod';

export const CreateWorkspaceSchema = z.object({
    organizationId: z.string().cuid(),
    name: z.string().min(2).max(200),
});

export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;

export const UpdateWorkspaceSchema = z.object({
    name: z.string().min(2).max(200),
});

export type UpdateWorkspaceDto = z.infer<typeof UpdateWorkspaceSchema>;