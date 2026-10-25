//backend/src/modules/workflows/contracts/workflow.dto.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// WORKFLOW
// ═══════════════════════════════════════════════════════════════

export const CreateWorkflowSchema = z.object({
    name: z.string().min(2).max(100),
    isActive: z.boolean().optional(),
});

export type CreateWorkflowDto = z.infer<typeof CreateWorkflowSchema>;

export const UpdateWorkflowSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    isActive: z.boolean().optional(),
});

export type UpdateWorkflowDto = z.infer<typeof UpdateWorkflowSchema>;

// ═══════════════════════════════════════════════════════════════
// STEP
// ═══════════════════════════════════════════════════════════════

export const CreateStepSchema = z.object({
    name: z.string().min(1).max(100),
    order: z.number().int().min(0),
    color: z.string().max(20).optional(),
});

export type CreateStepDto = z.infer<typeof CreateStepSchema>;

export const UpdateStepSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    order: z.number().int().min(0).optional(),
    color: z.string().max(20).optional(),
});

export type UpdateStepDto = z.infer<typeof UpdateStepSchema>;

// ═══════════════════════════════════════════════════════════════
// TRANSITION CONDITION (сначала объявляем — потом используем)
// ═══════════════════════════════════════════════════════════════

export const TransitionConditionSchema = z
    .object({
        type: z.enum(['checklist_done', 'field_required', 'field_value']),
        field: z.string().optional(),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    })
    .refine(
        (data) => {
            if (data.type === 'checklist_done') return true;
            if (data.type === 'field_required') return !!data.field;
            if (data.type === 'field_value') {
                return !!data.field && data.value !== undefined;
            }
            return false;
        },
        { message: 'Invalid condition configuration' },
    );

export type TransitionConditionDto = z.infer<typeof TransitionConditionSchema>;

// ═══════════════════════════════════════════════════════════════
// TRANSITION (использует TransitionConditionSchema — он уже выше)
// ═══════════════════════════════════════════════════════════════

export const CreateTransitionSchema = z.object({
    fromStepId: z.string().uuid(),
    toStepId: z.string().uuid(),
    name: z.string().max(100).optional(),
    conditions: z.array(TransitionConditionSchema).optional(),
});

export type CreateTransitionDto = z.infer<typeof CreateTransitionSchema>;

export const UpdateTransitionSchema = z.object({
    name: z.string().max(100).optional(),
    conditions: z.array(TransitionConditionSchema).optional(),
});

export type UpdateTransitionDto = z.infer<typeof UpdateTransitionSchema>;