//backend/src/modules/workflows/contracts/workflow.dto.ts
import { z } from 'zod';
// ═══════════════════════════════════════════════════════════════
// WORKFLOW
// ═══════════════════════════════════════════════════════════════
export const CreateWorkflowSchema = z.object({
    name: z.string().min(2).max(100),
    isActive: z.boolean().optional(),
});
export const UpdateWorkflowSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    isActive: z.boolean().optional(),
});
// ═══════════════════════════════════════════════════════════════
// STEP
// ═══════════════════════════════════════════════════════════════
export const CreateStepSchema = z.object({
    name: z.string().min(1).max(100),
    order: z.number().int().min(0),
    color: z.string().max(20).optional(),
});
export const UpdateStepSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    order: z.number().int().min(0).optional(),
    color: z.string().max(20).optional(),
});
// ═══════════════════════════════════════════════════════════════
// TRANSITION
// ═══════════════════════════════════════════════════════════════
export const CreateTransitionSchema = z.object({
    fromStepId: z.string().uuid(),
    toStepId: z.string().uuid(),
    name: z.string().max(100).optional(),
});
//# sourceMappingURL=workflow.dto.js.map