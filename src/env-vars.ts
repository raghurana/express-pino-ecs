import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),  
});

export const env = envSchema.parse(process.env);
