//backend/src/modules/marketing-dashboard/contracts/update-dashboard.dto.ts
import { z } from 'zod';
import { CreateDashboardSchema } from './create-dashboard.dto.js';

export const UpdateDashboardSchema = CreateDashboardSchema.partial();
export type UpdateDashboardDto = z.infer<typeof UpdateDashboardSchema>;