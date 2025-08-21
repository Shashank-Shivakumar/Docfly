import React, { useState } from 'react';
import { PDFUpload } from './components/PDFUpload';
import { Toolbar } from './components/Toolbar';
import { PageThumbnails } from './components/PageThumbnails';
import { PDFViewer } from './components/PDFViewer';
import { PropertiesPanel } from './components/PropertiesPanel';
import { FieldsList } from './components/FieldsList';
import { Chatbot } from './components/Chatbot';
import { usePDFDocument } from './hooks/usePDFDocument';
import { exportFillablePDF, exportFlattenedPDF, exportFormJSON, downloadPDF } from './utils/pdfExport';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  
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
    setError(null);
    
    try {
      await loadPDF(file);
    } catch (error) {
      console.error('Error loading PDF:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load PDF. Please check if the file is valid and try again.';
      setError(errorMessage);
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

  const handleFieldSelect = (field: any) => {
    setSelectedField(field);
    setShowPropertiesPanel(true);
  };

  const handleFieldUpdate = (fieldId: string, updates: any) => {
    updateField(fieldId, updates);
    // If the field is now configured, close the properties panel
    if (updates.isConfigured) {
      setShowPropertiesPanel(false);
    }
  };

  const handleFieldDelete = (fieldId: string) => {
    deleteField(fieldId);
    setShowPropertiesPanel(false);
    setSelectedField(null);
  };

  const handleDownload = async (type: 'fillable' | 'flattened' | 'json') => {
    if (!document) return;

    try {
      setIsLoading(true);
      
      if (type === 'json') {
        // Handle JSON download
        const jsonData = exportFormJSON(document);
        const filename = `${document.name.replace('.pdf', '')}_form.json`;
        
        // Create and download JSON file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = filename;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Console log the JSON data
        console.log('🔽 ======= FORM JSON DOWNLOAD =======');
        console.log('📄 JSON File Name:', filename);
        console.log('📊 Total Fields:', document.fields.length);
        console.log('📋 Form JSON Data:');
        console.log(jsonData);
        console.log('🔽 ===================================');
        
        // Also upload to chatbot backend for immediate use
        try {
          const formName = document.name.replace('.pdf', '').toLowerCase().replace(/\s+/g, '_');
          await fetch('http://localhost:8000/api/upload_form', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              form_name: formName,
              fields: JSON.parse(jsonData)
            })
          });
          console.log('✅ Form uploaded to chatbot backend successfully');
        } catch (uploadError) {
          console.warn('⚠️ Could not upload to chatbot backend:', uploadError);
        }
        
      } else {
        // Handle PDF downloads
        const pdfBytes = type === 'fillable' 
          ? await exportFillablePDF(document)
          : await exportFlattenedPDF(document);
        
        const filename = `${document.name.replace('.pdf', '')}_${type}.pdf`;
        downloadPDF(pdfBytes, filename);
      }
    } catch (error) {
      console.error('Error downloading:', error);
      alert(`Failed to download ${type === 'json' ? 'JSON' : 'PDF'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show chatbot if requested
  if (showChatbot) {
    return <Chatbot onBack={() => setShowChatbot(false)} />;
  }

  if (!document) {
    return (
      <div>
        <PDFUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
        
        {/* Chatbot Access Button */}
        <div className="fixed bottom-4 left-4">
          <button
            onClick={() => setShowChatbot(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Form Assistant</span>
          </button>
        </div>

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="font-medium">Upload Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChatbot(true)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Form Assistant</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Load New PDF
            </button>
          </div>
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
          onFieldSelect={(field) => {
            setSelectedField(field);
            setShowPropertiesPanel(true);
          }}
          onFieldUpdate={updateField}
        />

        {/* Right Side Panel - Properties or Fields List */}
        {showPropertiesPanel && selectedField ? (
          <PropertiesPanel
            selectedField={selectedField}
            onFieldUpdate={handleFieldUpdate}
            onFieldDelete={handleFieldDelete}
            onClose={() => {
              setShowPropertiesPanel(false);
              setSelectedField(null);
            }}
          />
        ) : (
          <FieldsList
            fields={document.fields}
            onFieldSelect={handleFieldSelect}
            selectedFieldId={selectedField?.id || null}
          />
        )}
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

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 text-red-400 hover:text-red-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;