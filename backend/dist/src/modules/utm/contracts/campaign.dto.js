//backend\src\modules\utm\contracts\campaign.dto.ts
import { z } from 'zod';
export const CreateCampaignSchema = z.object({
    name: z.string().min(1).max(100),
    label: z.string().min(1).max(200),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});
export const UpdateCampaignSchema = CreateCampaignSchema.partial();
//# sourceMappingURL=campaign.dto.js.map