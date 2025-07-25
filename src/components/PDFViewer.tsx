import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormField } from '../types';
import { FormFieldComponent } from './FormFieldComponent';

// Set up PDF.js worker with CDN and local fallback
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
} catch (error) {
  // Fallback to local worker file
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

interface PDFViewerProps {
  pdfFile: File | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (pages: number) => void;
  fields: FormField[];
  selectedField: FormField | null;
  selectedTool: string | null;
  onFieldAdd: (field: Omit<FormField, 'id'>) => void;
  onFieldSelect: (field: FormField | null) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfFile,
  currentPage,
  totalPages,
  onPageChange,
  onTotalPagesChange,
  fields,
  selectedField,
  selectedTool,
  onFieldAdd,
  onFieldSelect,
  onFieldUpdate
}) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [pageWidth, setPageWidth] = useState(612);
  const [pageHeight, setPageHeight] = useState(792);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onTotalPagesChange(numPages);
    setIsLoading(false);
    setLoadError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoadError('Failed to load PDF. Please check if the file is valid and try again.');
    setIsLoading(false);
  };

  const onPageLoadSuccess = (page: any) => {
    const { width, height } = page;
    setPageWidth(width);
    setPageHeight(height);
  };

  const onPageLoadError = (error: Error) => {
    console.error('Error loading page:', error);
  };

  // Reset loading state when file changes
  useEffect(() => {
    if (pdfFile) {
      setIsLoading(true);
      setLoadError(null);
    }
  }, [pdfFile]);

  const handleViewerClick = useCallback((e: React.MouseEvent) => {
    if (!selectedTool || isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newField: Omit<FormField, 'id'> = {
      type: selectedTool as any,
      x,
      y,
      width: selectedTool === 'signature' || selectedTool === 'initials' ? 150 : 120,
      height: selectedTool === 'paragraph' ? 80 : 32,
      pageNumber: currentPage,
      properties: {
        name: `${selectedTool}_${Date.now()}`,
        placeholder: `Enter ${selectedTool}`,
        required: false,
        fontSize: 12,
        bold: false,
        italic: false,
        backgroundColor: 'transparent',
        borderColor: '#d1d5db',
        borderWidth: 1,
        ...(selectedTool === 'dropdown' || selectedTool === 'radio' 
          ? { options: ['Option 1', 'Option 2', 'Option 3'] } 
          : {}
        )
      }
    };

    onFieldAdd(newField);
  }, [selectedTool, currentPage, onFieldAdd, zoom, isDragging]);

  const currentPageFields = fields.filter(field => field.pageNumber === currentPage);

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* PDF Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    onPageChange(page);
                  }
                }}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={1}
                max={totalPages}
              />
              <span className="text-sm text-gray-600">of {totalPages}</span>
            </div>
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleResetZoom}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {Math.round(zoom * 100)}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-center">
          <div
            ref={viewerRef}
            className="relative shadow-lg border border-gray-300"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              cursor: selectedTool ? 'crosshair' : 'default'
            }}
            onClick={handleViewerClick}
          >
            {pdfFile && !loadError ? (
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center w-96 h-96 bg-white border border-gray-300">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <div className="text-gray-600">Loading PDF...</div>
                    </div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center w-96 h-96 bg-white border border-gray-300">
                    <div className="text-center text-red-600">
                      <div className="text-lg mb-2">Failed to load PDF</div>
                      <div className="text-sm">Please check if the file is valid and try uploading again</div>
                    </div>
                  </div>
                }
                options={{
                  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                  cMapPacked: true,
                }}
              >
                <Page
                  pageNumber={currentPage}
                  onLoadSuccess={onPageLoadSuccess}
                  onLoadError={onPageLoadError}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="relative"
                  loading={
                    <div className="flex items-center justify-center w-96 h-96 bg-white border border-gray-300">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  }
                />
              </Document>
            ) : loadError ? (
              <div className="flex items-center justify-center w-96 h-96 bg-white border border-gray-300">
                <div className="text-center text-red-600">
                  <div className="text-lg mb-2">Failed to Preview PDF</div>
                  <div className="text-sm mb-4">{loadError}</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-96 h-96 bg-white border border-gray-300 text-gray-400 text-lg">
                No PDF loaded
              </div>
            )}

            {/* Form Fields Overlay */}
            {pdfFile && !loadError && currentPageFields.map((field) => (
              <FormFieldComponent
                key={field.id}
                field={field}
                isSelected={selectedField?.id === field.id}
                onSelect={() => onFieldSelect(field)}
                onUpdate={(updates) => onFieldUpdate(field.id, updates)}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                zoom={zoom}
              />
            ))}

            {/* Selection Guide */}
            {selectedTool && pdfFile && !loadError && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm shadow-lg">
                  Click to add {selectedTool} field
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};