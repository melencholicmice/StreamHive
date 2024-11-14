import { z } from 'zod';

export const uploadCompleteSchema = z.object({
  key: z.string(),
  uploadId: z.string(),
  parts: z.array(z.any()),
  videoId: z.string(),
  videoName: z.string(),
});

export type uploadCompleteDto = z.infer<typeof uploadCompleteSchema>;

type metadata = {
  httpStatusCode: number;
  requestId: string;
  extendedRequestId: string;
  cfId: undefined;
  attempts: number;
  totalRetryDelay: number;
};

export type uploadCompleteResponse = {
  $metadata: metadata;
  Bucket: string;
  ETag: string;
  Key: string;
  Location: string;
};
