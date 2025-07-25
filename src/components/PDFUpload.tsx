import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface PDFUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onFileUpload, isLoading }) => {
  const validateAndUploadFile = useCallback((file: File) => {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 50MB');
      return;
    }

    // Validate file size (min 1KB)
    if (file.size < 1024) {
      alert('File appears to be corrupted or empty');
      return;
    }

    onFileUpload(file);
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFile) {
      validateAndUploadFile(pdfFile);
    } else {
      alert('Please drop a valid PDF file');
    }
  }, [validateAndUploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUploadFile(file);
    }
  }, [validateAndUploadFile]);

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
              accept=".pdf,application/pdf"
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

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>PDF files (.pdf)</li>
                <li>Maximum size: 50MB</li>
                <li>Standard PDF format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};