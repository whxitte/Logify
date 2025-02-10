import React from 'react';
import { Upload } from 'lucide-react';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({ onFileSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500 p-3 rounded-full mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Log File Analysis</h1>
          <p className="text-gray-300 text-center mb-6">
            Select a log file to begin analysis
          </p>
        </div>

        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".log,.txt,.out"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-800 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-700"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                LOG, TXT, or OUT files
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};