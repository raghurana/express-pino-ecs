import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().optional().default(3000),
  SERVICE_NAME: z.string({ error: 'SERVICE_NAME is required' }),
  LOG_LEVEL: z.string().optional().default("info"),
});

export const env = envSchema.parse(process.env);
