//backend\src\modules\auth\contracts\verify-login.dto.ts
import { z } from 'zod';

export const VerifyLoginSchema = z.object({
    verificationToken: z.string(),
    code: z.string().length(6),
});

export type VerifyLoginDto = z.infer<typeof VerifyLoginSchema>;