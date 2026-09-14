//backend\src\modules\auth\contracts\login.dto.ts
import { z } from 'zod';
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
});
//# sourceMappingURL=login.dto.js.map