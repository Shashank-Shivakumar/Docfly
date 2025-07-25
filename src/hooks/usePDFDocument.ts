import { useState, useCallback } from 'react';
import { FormField, PDFDocument } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const usePDFDocument = () => {
  const [document, setDocument] = useState<PDFDocument | null>(null);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [history, setHistory] = useState<PDFDocument[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const loadPDF = useCallback(async (file: File): Promise<void> => {
    try {
      // Validate file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Please select a valid PDF file');
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Please select a file smaller than 50MB');
      }

      // Create a new PDF document object
      const newDoc: PDFDocument = {
        id: uuidv4(),
        name: file.name,
        file,
        pages: 1, // Will be updated when PDF loads
        fields: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Set the document immediately to trigger PDF loading in the viewer
      setDocument(newDoc);
      setHistory([newDoc]);
      setHistoryIndex(0);
      setCurrentPage(1);
      setSelectedField(null);
      setSelectedTool(null);
      
      // Reset totalPages - will be updated by onDocumentLoadSuccess
      setTotalPages(0);

    } catch (error) {
      console.error('Error in loadPDF:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  }, []);

  const updateTotalPages = useCallback((pages: number) => {
    setTotalPages(pages);
    if (document) {
      const updatedDoc = { ...document, pages };
      setDocument(updatedDoc);
      
      // Update history as well
      const newHistory = [...history];
      if (newHistory[historyIndex]) {
        newHistory[historyIndex] = updatedDoc;
        setHistory(newHistory);
      }
    }
  }, [document, history, historyIndex]);

  const addField = useCallback((fieldData: Omit<FormField, 'id'>) => {
    if (!document) return;

    const newField: FormField = {
      ...fieldData,
      id: uuidv4()
    };

    const updatedDoc = {
      ...document,
      fields: [...document.fields, newField],
      updatedAt: new Date()
    };

    setDocument(updatedDoc);
    setSelectedField(newField);
    setSelectedTool(null);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedDoc);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [document, history, historyIndex]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    if (!document) return;

    const updatedFields = document.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );

    const updatedDoc = {
      ...document,
      fields: updatedFields,
      updatedAt: new Date()
    };

    setDocument(updatedDoc);
    
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  }, [document, selectedField]);

  const deleteField = useCallback((fieldId: string) => {
    if (!document) return;

    const updatedFields = document.fields.filter(field => field.id !== fieldId);
    const updatedDoc = {
      ...document,
      fields: updatedFields,
      updatedAt: new Date()
    };

    setDocument(updatedDoc);
    setSelectedField(null);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedDoc);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [document, history, historyIndex]);

  const clearAllFields = useCallback(() => {
    if (!document) return;

    const updatedDoc = {
      ...document,
      fields: [],
      updatedAt: new Date()
    };

    setDocument(updatedDoc);
    setSelectedField(null);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedDoc);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [document, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setDocument(history[newIndex]);
      setHistoryIndex(newIndex);
      setSelectedField(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setDocument(history[newIndex]);
      setHistoryIndex(newIndex);
      setSelectedField(null);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
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
  };
};