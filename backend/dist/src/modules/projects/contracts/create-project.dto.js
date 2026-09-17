//backend\src\modules\projects\contracts\create-project.dto.ts
import { z } from 'zod';
export const CreateProjectSchema = z.object({
    workspaceId: z.string().uuid(),
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});
export const UpdateProjectSchema = CreateProjectSchema.partial();
//# sourceMappingURL=create-project.dto.js.map