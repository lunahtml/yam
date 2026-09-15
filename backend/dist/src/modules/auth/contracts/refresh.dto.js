//backend\src\modules\auth\contracts\refresh.dto.ts
import { z } from 'zod';
export const RefreshSchema = z.object({
    refreshToken: z.string().min(10),
});
export const LogoutSchema = RefreshSchema;
//# sourceMappingURL=refresh.dto.js.map