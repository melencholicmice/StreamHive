import { config } from "../config";

type Part = {
    ETag: string;
    PartNumber: number;
};
  
export const completeMultipartUpload = async (
    key: string,
    uploadId: string,
    parts: Part[],
    videoId: string,
) : Promise<void> => {
    await fetch(`${config.mediaAuthApiUrl}/videos/upload-complete`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'credentials': 'include'
        },
        body: JSON.stringify({
          key: key,
          uploadId: uploadId,
          parts: parts,
          videoId: videoId,
        }),
        credentials: 'include',
    });

}
