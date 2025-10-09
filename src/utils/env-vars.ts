import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    LOG_LEVEL: z.string().optional().default('info'),
    SERVICE_NAME: z.string().min(1, { error: 'SERVICE_NAME is required' }),
    PORT: z.coerce.number().optional().default(3000),
});

export const env = envSchema.parse(process.env);
