//backend\src\modules\artifacts\contracts\update-artifact.dto.ts
import { z } from 'zod';
import { CreateArtifactSchema } from './create-artifact.dto.js';

export const UpdateArtifactSchema = CreateArtifactSchema.partial();
export type UpdateArtifactDto = z.infer<typeof UpdateArtifactSchema>;