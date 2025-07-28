import React, { useState, useRef, useCallback } from 'react';
import { FormField } from '../types';
import { Maximize as Resize, Move, Trash2 } from 'lucide-react';

interface FormFieldComponentProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  zoom: number;
  relatedQuestions?: FormField[]; // Questions related to this field
}

export const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDragStart,
  onDragEnd,
  zoom,
  relatedQuestions = []
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    
    if (e.target === fieldRef.current) {
      setIsDragging(true);
      onDragStart();
      setDragStart({
        x: e.clientX - field.x * zoom,
        y: e.clientY - field.y * zoom
      });
    }
  }, [field.x, field.y, onSelect, onDragStart, zoom]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      onUpdate({ x: Math.max(0, newX), y: Math.max(0, newY) });
    }
  }, [isDragging, dragStart, onUpdate, zoom]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
    if (isResizing) {
      setIsResizing(false);
    }
  }, [isDragging, isResizing, onDragEnd]);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const renderFieldContent = () => {
    const { type, properties } = field;
    const style = {
      fontSize: `${properties.fontSize}px`,
      fontWeight: properties.bold ? 'bold' : 'normal',
      fontStyle: properties.italic ? 'italic' : 'normal',
      backgroundColor: properties.backgroundColor !== 'transparent' ? properties.backgroundColor : 'transparent',
      border: `${properties.borderWidth}px solid ${properties.borderColor}`,
      width: '100%',
      height: '100%',
      outline: 'none',
      padding: '4px 8px',
      borderRadius: '2px'
    };

    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={properties.placeholder}
            className="resize-none"
            style={style}
            readOnly
          />
        );
      
      case 'paragraph':
        return (
          <textarea
            placeholder={properties.placeholder}
            className="resize-none"
            style={style}
            readOnly
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center h-full">
            <input type="checkbox" className="mr-2" readOnly />
            <span style={{ fontSize: `${properties.fontSize}px` }}>
              {properties.placeholder || 'Checkbox'}
            </span>
          </div>
        );
      
      case 'radio':
        return (
          <div className="flex items-center h-full">
            <input type="radio" className="mr-2" readOnly />
            <span style={{ fontSize: `${properties.fontSize}px` }}>
              {properties.placeholder || 'Radio Option'}
            </span>
          </div>
        );
      
      case 'dropdown':
        return (
          <select style={style} disabled>
            <option>{properties.placeholder || 'Select an option'}</option>
            {properties.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            style={style}
            readOnly
          />
        );
      
      case 'signature':
        return (
          <div
            className="flex items-center justify-center border-2 border-dashed border-gray-400 text-gray-600"
            style={{ 
              ...style, 
              borderStyle: 'dashed',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }}
          >
            Signature
          </div>
        );
      
      case 'initials':
        return (
          <div
            className="flex items-center justify-center border-2 border-dashed border-gray-400 text-gray-600"
            style={{ 
              ...style, 
              borderStyle: 'dashed',
              backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }}
          >
            Initials
          </div>
        );
      
      case 'question':
        return (
          <div
            className="flex items-start space-x-2 p-2 bg-yellow-50 border-2 border-yellow-200 rounded-lg"
            style={{ 
              ...style, 
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderColor: '#fbbf24'
            }}
          >
            <div className="flex-shrink-0 mt-1">
              <div className="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                ?
              </div>
            </div>
            <div className="flex-1 text-sm text-gray-800">
              {properties.questionText || 'Enter your question here...'}
            </div>
          </div>
        );
      
      default:
        return (
          <div style={style} className="flex items-center justify-center text-gray-500">
            {type}
          </div>
        );
    }
  };

  return (
    <div
      ref={fieldRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: field.x,
        top: field.y,
        width: field.width,
        height: field.height,
        zIndex: isSelected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Display related questions above text fields */}
      {relatedQuestions.length > 0 && (field.type === 'text' || field.type === 'paragraph') && (
        <div className="absolute -top-16 left-0 right-0">
          {relatedQuestions.map((question) => (
            <div
              key={question.id}
              className="mb-2 p-2 bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-sm"
              style={{ minWidth: '200px' }}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-4 h-4 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    ?
                  </div>
                </div>
                <div className="flex-1 text-xs text-gray-800">
                  {question.properties.questionText || 'Question'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {renderFieldContent()}
      
      {isSelected && (
        <>
          {/* Selection Handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize">
            <Resize className="w-2 h-2 text-white" />
          </div>
          
          {/* Field Label */}
          <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {field.properties.name}
          </div>
        </>
      )}
    </div>
  );
};