//backend\src\modules\auth\contracts\verify-email.dto.ts
import { z } from 'zod';

export const VerifyEmailSchema = z.object({
    verificationToken: z.string(),
    code: z.string().length(6),
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;