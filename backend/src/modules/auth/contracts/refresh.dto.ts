//backend\src\modules\auth\contracts\refresh.dto.ts
import { z } from 'zod';

export const RefreshSchema = z.object({
    refreshToken: z.string().min(10),
});

export type RefreshDto = z.infer<typeof RefreshSchema>;

export const LogoutSchema = RefreshSchema;
export type LogoutDto = z.infer<typeof LogoutSchema>;