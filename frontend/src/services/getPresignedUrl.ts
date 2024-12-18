import { config } from "../config";

export const getPresignedUrl = async (UploadId: string, key: string, partNumber: number, videoName: string): Promise<string> => {
    const presignedUrlResponse = await fetch(`${config.mediaAuthApiUrl}/videos/presigned-url?key=${key}&uploadId=${UploadId}&partNumber=${partNumber}&videoName=${videoName}`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'credentials': 'include'
        },
        credentials: 'include',
    });
    const { url: presignedUrl } = await presignedUrlResponse.json();
    return presignedUrl
};
