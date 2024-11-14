import { useState, useEffect } from 'react';
import { getAllVideos, VideoResponse } from '../services/getAllVideos';

const AllVideos = () => {
  const [videos, setVideos] = useState<VideoResponse[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      await getAllVideos().then((videos) => {
        setVideos(videos);
      });
    };
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">All Videos</h1>
        <div className="bg-white shadow rounded-lg">
          {videos.map((video) => (
            <a
              // key={video.id}
              href={`/video?id=${video.id}`}
              className="block px-6 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition duration-200 mb-4"
            >
              <h2 className="text-xl font-medium text-gray-900 hover:text-blue-500">
                {video.title}
              </h2>
              <p className="text-gray-600 mt-1">{video.description}</p>
            </a>
          ))}
          {videos.length === 0 && (
            <p className="text-center py-8 text-gray-500">No videos available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllVideos;