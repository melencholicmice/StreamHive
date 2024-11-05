import { useState } from 'react';
import { initiateMultipartUpload } from '../services/initiateMultipartUpload';
import { getPresignedUrl } from '../services/getPresignedUrl';
import { uploadChunk } from '../services/uploadChunk';
import { completeMultipartUpload } from '../services/completeMultipartUrl';
import { removeFileExtension } from '../utils/removeFileExtention';

type Part = {
  ETag: string;
  PartNumber: number;
};

function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    try{
      const UploadId = await initiateMultipartUpload(file);
  
      const partSize = 5 * 1024 * 1024; // 5MB
      const parts: Part[] = [];
      let partNumber = 1;
  
      for (let start = 0; start < file.size; start += partSize) {
        const end = Math.min(start + partSize, file.size);
        const fileChunk = file.slice(start, end);
  
        const presignedUrl = await getPresignedUrl(UploadId, removeFileExtension(file.name),partNumber) 
        console.log(presignedUrl)
        const uploadResponse = await uploadChunk(presignedUrl, fileChunk, UploadId);
        const eTag = uploadResponse.headers.get('ETag') || '';
        parts.push({ ETag: eTag, PartNumber: partNumber });
        partNumber++;
      }
  
      await completeMultipartUpload(
        removeFileExtension(file.name),
        UploadId,
        parts
      )
      alert('File uploaded successfully');
    }
    catch(error){
      alert('Failed to upload file');
    }
    
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload File</button>
    </div>
  );
}

export default FileUpload;

