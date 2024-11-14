import { z } from 'zod';

export const uploadVideoSchema = z.object({
  key: z.string(),
  description: z.string(),
  videoName: z.string(),
});

export type uploadVideoDto = z.infer<typeof uploadVideoSchema>;
