//backend\src\modules\members\contracts\add-member.dto.ts
import { z } from 'zod';
export const AddMemberSchema = z.object({
    userId: z.string().uuid(),
    role: z.string().min(1).max(50).default('member'),
});
export const UpdateMemberSchema = z.object({
    role: z.string().min(1).max(50),
});
//# sourceMappingURL=add-member.dto.js.map