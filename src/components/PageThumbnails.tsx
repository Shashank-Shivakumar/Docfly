import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PageThumbnailsProps {
  pdfFile: File | null;
  pages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
}

export const PageThumbnails: React.FC<PageThumbnailsProps> = ({
  pdfFile,
  pages,
  currentPage,
  onPageSelect
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Pages ({pages})</h3>
      </div>
      
      <div className="p-3 space-y-3">
        {Array.from({ length: pages }, (_, index) => (
          <div
            key={index}
            onClick={() => onPageSelect(index + 1)}
            className={`relative cursor-pointer rounded-lg border-2 transition-all ${
              currentPage === index + 1
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[8.5/11] bg-gray-100 rounded-lg overflow-hidden">
              {pdfFile ? (
                <Document
                  file={pdfFile}
                  loading={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-xs text-gray-400">Loading...</div>
                    </div>
                  }
                  error={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-xs text-red-400">Error</div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={index + 1}
                    width={200}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              ) : (
                <div className="w-full h-full bg-white rounded border border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No Preview</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};