import { config } from "../config"

export type Video = {
    id: string
    title: string
    description: string
    bucket: string
    status: string
    createdAt: Date
    updatedAt: Date
}


export const getAllUserVideos = async (): Promise<Video[]> => {
    const presignedUrlResponse = await fetch(`${config.mediaAuthApiUrl}/videos/user-videos`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'credentials': 'include'
        },
        credentials: 'include',
    });
    const videos : Video[] = await presignedUrlResponse.json();
    return videos;
};