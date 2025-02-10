import React, { useState } from 'react';
import { FileSelector } from './components/FileSelector';
import { Dashboard } from './components/Dashboard';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gray-900">
      {!selectedFile ? (
        <FileSelector onFileSelect={setSelectedFile} />
      ) : (
        <Dashboard logFile={selectedFile} />
      )}
    </div>
  );
}

export default App;