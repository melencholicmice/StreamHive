import { config } from "../config";

export type VideoResponse = {
    createdAt: string
    updatedAt: string
    id: string
    title: string
    description: string
    bucket: string
    status: string
    user: {
        id: string
        username: string
    }
}

export type VideoByIdResponse = {
    createdAt: string
    updatedAt: string
    id: string
    title: string
    description: string
    bucket: string
    status: string
}


export const getAllVideos = async (): Promise<VideoResponse[]> => {
    const response = await fetch(`${config.mediaAuthApiUrl}/videos/all-videos`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
   const responseData : VideoResponse[] = await response.json();
   return responseData;
};

export const getVideosById = async (videoId: string): Promise<VideoByIdResponse> => {
    console.log("Video Id :- ",  videoId)
    const response = await fetch(`${config.mediaAuthApiUrl}/videos/video-by-id?videoId=${videoId}`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
   const responseData : VideoByIdResponse = await response.json();
   return responseData;
};

