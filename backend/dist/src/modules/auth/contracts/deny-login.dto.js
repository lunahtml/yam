//backend\src\modules\auth\contracts\deny-login.dto.ts
import { z } from 'zod';
export const DenyLoginSchema = z.object({
    verificationToken: z.string(),
});
//# sourceMappingURL=deny-login.dto.js.map