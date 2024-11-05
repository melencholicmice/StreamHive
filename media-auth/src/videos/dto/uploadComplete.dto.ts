import { z } from 'zod';

export const uploadCompleteSchema = z.object({
    key : z.string(),
    uploadId: z.string(),
    parts: z.array(z.any()),
})

export type uploadCompleteDto = z.infer<typeof uploadCompleteSchema>;