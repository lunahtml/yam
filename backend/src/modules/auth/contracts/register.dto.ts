//backend\src\modules\auth\contracts\register.dto.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(12).max(100),
    name: z.string().min(2).max(100).optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;