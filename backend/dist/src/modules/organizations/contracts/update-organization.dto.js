//backend\src\modules\organizations\contracts\update-organization.dto.ts
import { z } from 'zod';
export const UpdateOrganizationSchema = z.object({
    name: z.string().min(2).max(200),
});
//# sourceMappingURL=update-organization.dto.js.map