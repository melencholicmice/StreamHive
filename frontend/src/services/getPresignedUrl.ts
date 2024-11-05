import { config } from "../config";

export const getPresignedUrl = async (UploadId: string, Filekey: string, partNumber: number): Promise<string> => {
    const presignedUrlResponse = await fetch(`${config.mediaAuthApiUrl}/videos/presigned-url?key=${Filekey}&uploadId=${UploadId}&partNumber=${partNumber}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const { url: presignedUrl } = await presignedUrlResponse.json();
    return presignedUrl
};
config