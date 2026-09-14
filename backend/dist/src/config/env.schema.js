//backend\src\config\env.schema.ts
import { z } from 'zod';
export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    PORT: z.coerce.number().default(3000),
    SMTP_HOST: z.string().default('mailhog'),
    SMTP_PORT: z.coerce.number().default(1025),
    CORS_ORIGIN: z.string().optional(),
});
//# sourceMappingURL=env.schema.js.map