//backend\src\modules\members\contracts\add-member.dto.ts
import { z } from 'zod';

export const AddMemberSchema = z.object({
    userId: z.string().uuid(),
    role: z.string().min(1).max(50).default('member'),
});

export type AddMemberDto = z.infer<typeof AddMemberSchema>;

export const UpdateMemberSchema = z.object({
    role: z.string().min(1).max(50),
});

export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;