//backend\src\modules\workspaces\contracts\create-workspace.dto.ts
import { z } from 'zod';
export const CreateWorkspaceSchema = z.object({
    organizationId: z.string().uuid(),
    name: z.string().min(2).max(200),
});
export const UpdateWorkspaceSchema = z.object({
    name: z.string().min(2).max(200),
});
//# sourceMappingURL=create-workspace.dto.js.map