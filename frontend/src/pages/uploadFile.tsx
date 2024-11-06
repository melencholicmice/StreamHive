import FileUpload from "../components/fileUpload";

const UploadFilePage: React.FC = () => {

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Upload File
        </h1>
        <div className="mt-8">
          <FileUpload />
        </div>
      </div>
    </div>
  );
};

export default UploadFilePage;
