//backend/src/modules/sprints/contracts/complete-sprint.dto.ts
import { z } from 'zod';

export const GoalActionSchema = z.enum([
    'ACHIEVED',
    'CARRIED_OVER',
    'MOVED_BACKLOG',
    'CANCELLED',
]);

export const CompleteGoalSchema = z.object({
    id: z.string().uuid(),
    action: GoalActionSchema,
});

export const CompleteSprintSchema = z.object({
    goals: z.array(CompleteGoalSchema).default([]),
    createNextSprint: z.boolean().default(true),
    nextSprint: z
        .object({
            name: z.string().min(2).max(200),
            startDate: z.string(),
            endDate: z.string(),
            goal: z.string().max(1000).optional(),
        })
        .optional(),
    carryOverTasks: z.boolean().default(false),
});

export type CompleteSprintDto = z.infer<typeof CompleteSprintSchema>;