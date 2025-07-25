import React, { useState } from 'react';
import { PDFUpload } from './components/PDFUpload';
import { Toolbar } from './components/Toolbar';
import { PageThumbnails } from './components/PageThumbnails';
import { PDFViewer } from './components/PDFViewer';
import { PropertiesPanel } from './components/PropertiesPanel';
import { usePDFDocument } from './hooks/usePDFDocument';
import { exportFillablePDF, exportFlattenedPDF, downloadPDF } from './utils/pdfExport';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    document,
    selectedField,
    selectedTool,
    currentPage,
    totalPages,
    canUndo,
    canRedo,
    loadPDF,
    updateTotalPages,
    addField,
    updateField,
    deleteField,
    clearAllFields,
    setSelectedField,
    setSelectedTool,
    setCurrentPage,
    undo,
    redo
  } = usePDFDocument();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      await loadPDF(file);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (document) {
      // Save to localStorage for demo purposes
      localStorage.setItem(`pdf-document-${document.id}`, JSON.stringify(document));
      alert('Document saved successfully!');
    }
  };

  const handleDownload = async (type: 'fillable' | 'flattened') => {
    if (!document) return;

    try {
      setIsLoading(true);
      const pdfBytes = type === 'fillable' 
        ? await exportFillablePDF(document)
        : await exportFlattenedPDF(document);
      
      const filename = `${document.name.replace('.pdf', '')}_${type}.pdf`;
      downloadPDF(pdfBytes, filename);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!document) {
    return <PDFUpload onFileUpload={handleFileUpload} isLoading={isLoading} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">PDF Form Builder</h1>
            <p className="text-sm text-gray-600">{document.name}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Load New PDF
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onSave={handleSave}
        onDownload={handleDownload}
        onUndo={undo}
        onRedo={redo}
        onClear={clearAllFields}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page Thumbnails */}
        <PageThumbnails
          pdfFile={document.file}
          pages={document.pages}
          currentPage={currentPage}
          onPageSelect={setCurrentPage}
        />

        {/* PDF Viewer */}
        <PDFViewer
          pdfFile={document.file}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onTotalPagesChange={updateTotalPages}
          fields={document.fields}
          selectedField={selectedField}
          selectedTool={selectedTool}
          onFieldAdd={addField}
          onFieldSelect={setSelectedField}
          onFieldUpdate={updateField}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          selectedField={selectedField}
          onFieldUpdate={updateField}
          onFieldDelete={deleteField}
          onClose={() => setSelectedField(null)}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;