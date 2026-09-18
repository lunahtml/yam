//backend\src\modules\users\contracts\update-user.dto.ts
import { z } from 'zod';
export const UpdateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().url().max(500).optional().or(z.literal('')),
});
//# sourceMappingURL=update-user.dto.js.map