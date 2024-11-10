import { useState, useEffect } from 'react';
import VideoPlayer from '../components/videoPlayer';
import { useSearchParams } from 'react-router-dom';
import { getVideosById } from '../services/getAllVideos';
import { config } from '../config';

interface VideoDetails {
  title: string;
  username: string;
  description: string;
  videoUrl: string;
}

const VideoPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  console.log(id);
  const [videoDetails, setVideoDetails] = useState<VideoDetails>({
    title: '',
    username: '',
    description: '',
    videoUrl: ''
  });

  useEffect(() => {
    const fetchVideoDetails = async () => {
      await getVideosById(id!).then((video) => {
        setVideoDetails({
          title: video.title,
          username: video.id,
          description: video.description,
          videoUrl: `${config.s3Endpoint}/${video.bucket}index.m3u8`
        });
      });
    };

    fetchVideoDetails();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <VideoPlayer videoSource={videoDetails.videoUrl} />
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {videoDetails.title}
            </h1>
            
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium">
                  {videoDetails.username.charAt(0)}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900">
                  {videoDetails.username}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {videoDetails.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;