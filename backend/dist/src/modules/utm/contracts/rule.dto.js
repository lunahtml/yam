//backend\src\modules\utm\contracts\rule.dto.ts
import { z } from 'zod';
export const ConditionOperatorSchema = z.enum([
    'eq',
    'ne',
    'contains',
    'startsWith',
    'endsWith',
    'in',
]);
export const RuleConditionSchema = z.object({
    field: z.string().min(1),
    operator: ConditionOperatorSchema,
    value: z.union([z.string(), z.array(z.string())]),
});
export const CreateRuleSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(1000).optional(),
    priority: z.number().int().default(0),
    isActive: z.boolean().default(true),
    conditions: z.array(RuleConditionSchema).default([]),
    sourceTemplate: z.string().min(1).max(100),
    mediumTemplate: z.string().min(1).max(100),
    campaignTemplate: z.string().max(200).optional(),
    contentTemplate: z.string().max(200).optional(),
    termTemplate: z.string().max(200).optional(),
});
export const UpdateRuleSchema = CreateRuleSchema.partial();
//# sourceMappingURL=rule.dto.js.map