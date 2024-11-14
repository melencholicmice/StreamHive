import { User } from "../services/checkUserLogin";
import { Video, getAllUserVideos } from "../services/getUserVideos";
import { useEffect, useState } from "react";

const Profile = ({ id, username, firstName, lastName, email, createdAt, updatedAt }: User) => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const userVideos = await getAllUserVideos();
      setVideos(userVideos);
    };
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-2xl font-bold mb-8">Profile Information</h2>
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="flex items-center">
            <label className="font-medium text-gray-700 w-32">Username:</label>
            <span className="text-gray-900">{username}</span>
          </div>
          <div className="flex items-center">
            <label className="font-medium text-gray-700 w-32">Name:</label>
            <span className="text-gray-900">{firstName} {lastName}</span>
          </div>
          <div className="flex items-center">
            <label className="font-medium text-gray-700 w-32">Email:</label>
            <span className="text-gray-900">{email}</span>
          </div>
          <div className="flex items-center">
            <label className="font-medium text-gray-700 w-32">Member Since:</label>
            <span className="text-gray-900">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Your Videos</h3>
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white shadow rounded-lg p-4">
                <h4 className="font-bold">{video.title}</h4>
                <p className="text-gray-600">{video.description}</p>
                <p className="text-sm text-gray-500 mt-2">Status: {video.status}</p>
                <p className="text-sm text-gray-500">
                  Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;