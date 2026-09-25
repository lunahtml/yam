//backend/src/modules/onboarding/contracts/create-demo.dto.ts
import { z } from 'zod';

export const CreateDemoSchema = z.object({}).strict();

export type CreateDemoDto = z.infer<typeof CreateDemoSchema>;