//backend\src\modules\sprints\contracts\create-metric.dto.ts
import { z } from 'zod';
export const MetricTypeSchema = z.enum(['INCREASE', 'DECREASE', 'TARGET']);
export const CreateMetricSchema = z.object({
    key: z.string().min(1).max(50),
    label: z.string().min(1).max(200),
    metricType: MetricTypeSchema,
    targetValue: z.number(),
    actualValue: z.number().optional(),
    unit: z.string().max(20).optional(),
    xpReward: z.number().int().min(0).default(0),
});
export const UpdateMetricSchema = CreateMetricSchema.partial();
//# sourceMappingURL=create-metric.dto.js.map