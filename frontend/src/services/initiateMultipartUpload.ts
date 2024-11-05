import { config } from "../config";
import { removeFileExtension } from "../utils/removeFileExtention";

export const initiateMultipartUpload = async (file: File): Promise<string> => {
  const response = await fetch(`${config.mediaAuthApiUrl}/videos/upload-start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: removeFileExtension(file.name),
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to initiate multipart upload: ${response.statusText}`);
  }
  const { uploadId } = await response.json();
  return uploadId;
};
