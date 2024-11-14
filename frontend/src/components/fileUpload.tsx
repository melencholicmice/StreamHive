import { useState } from 'react';
import { initiateMultipartUpload } from '../services/initiateMultipartUpload';
import { getPresignedUrl } from '../services/getPresignedUrl';
import { uploadChunk } from '../services/uploadChunk';
import { completeMultipartUpload } from '../services/completeMultipartUrl';
// import { removeFileExtension } from '../utils/removeFileExtention';

type Part = {
  ETag: string;
  PartNumber: number;
};

function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [videoName, setVideoName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoName(e.target.value);
  };

  const uploadFile = async () => {
    if (!file || !description || !videoName) {
      alert('Please fill in all fields');
      return;
    }
    try{
      const {uploadId,videoId } = await initiateMultipartUpload(
        file.name,
        description,
        videoName,
      );
  
      const partSize = 5 * 1024 * 1024; // 5MB
      const parts: Part[] = [];
      let partNumber = 1;
  
      for (let start = 0; start < file.size; start += partSize) {
        const end = Math.min(start + partSize, file.size);
        const fileChunk = file.slice(start, end);
  
        const presignedUrl = await getPresignedUrl(uploadId, file.name, partNumber, videoName) 
        console.log(presignedUrl)
        const uploadResponse = await uploadChunk(presignedUrl, fileChunk, uploadId);
        const eTag = uploadResponse.headers.get('ETag') || '';
        parts.push({ ETag: eTag, PartNumber: partNumber });
        partNumber++;
      }
  
      await completeMultipartUpload(
        file.name,
        uploadId,
        parts,
        videoId,
        videoName
      )
      alert('File uploaded successfully please wait for some time for the video to be processed');
      setFile(null);
      setDescription('');
      setVideoName('');
    }
    catch(error){
      alert('Failed to upload file');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Video Name:</label>
        <input 
          type="text" 
          value={videoName}
          onChange={handleNameChange}
          placeholder="Enter video name"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
        <textarea 
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Enter file description"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Select File:</label>
        <input 
          type="file" 
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button 
        onClick={uploadFile}
        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Upload File
      </button>
    </div>
  );
}

export default FileUpload;