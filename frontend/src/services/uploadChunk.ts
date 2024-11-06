export const uploadChunk = async (presignedUrl: string, fileChunk: Blob, uploadId: string): Promise<Response> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileChunk,
      headers: { 
        'Content-Type': 'application/octet-stream',
        'uploadId': uploadId,
        'credentials': 'include'
      },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to upload chunk: ${response.statusText}`);
    }
    return response;
};