import { config } from "../config";
type InitiateMultipartUploadResponse = {
  uploadId: string;
  videoId: string;
};


export const initiateMultipartUpload = async (key: string, description: string, videoName: string): Promise<InitiateMultipartUploadResponse> => {
  const response = await fetch(`${config.mediaAuthApiUrl}/videos/upload-start`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'credentials': 'include'
    },
    body: JSON.stringify({
      key: key,
      description: description,
      videoName: videoName,
    }),
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Failed to initiate multipart upload: ${response.statusText}`);
  }
  const responseData: InitiateMultipartUploadResponse = await response.json();
  return responseData;
};