//backend\src\modules\fields\contracts\create-field.dto.ts
import { z } from 'zod';

export const FieldTypeSchema = z.enum([
    'text',
    'number',
    'date',
    'boolean',
    'select',
    'user',
]);

export const CreateFieldSchema = z.object({
    name: z.string().min(1).max(50).regex(/^[a-z][a-z0-9_]*$/, {
        message: 'Name must be lowercase latin, starts with letter',
    }),
    label: z.string().min(2).max(200),
    type: FieldTypeSchema,
    options: z.record(z.string(), z.unknown()).optional(),
    isRequired: z.boolean().default(false),
    defaultValue: z.unknown().optional(),
});

export type CreateFieldDto = z.infer<typeof CreateFieldSchema>;