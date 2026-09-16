//backend\src\modules\organizations\contracts\create-organization.dto.ts
import { z } from 'zod';
export const CreateOrganizationSchema = z.object({
    name: z.string().min(2).max(200),
});
//# sourceMappingURL=create-organization.dto.js.map