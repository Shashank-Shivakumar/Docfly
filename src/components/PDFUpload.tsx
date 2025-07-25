import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface PDFUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onFileUpload, isLoading }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    if (pdfFile) {
      onFileUpload(pdfFile);
    }
  }, [onFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF Form Builder</h1>
          <p className="text-gray-600">Upload a PDF to start adding form fields</p>
        </div>

        <div
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your PDF here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">PDF files only, up to 50MB</p>
          
          <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Choose PDF File
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>

        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Processing PDF...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};