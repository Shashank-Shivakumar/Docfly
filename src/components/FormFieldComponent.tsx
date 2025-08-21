import React, { useState, useRef, useCallback } from 'react';
import { FormField } from '../types';
import { Maximize as Resize } from 'lucide-react';

interface FormFieldComponentProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  zoom: number;
}

export const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDragStart,
  onDragEnd,
  zoom
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    
    // Allow dragging from anywhere on the field, not just the container
    setIsDragging(true);
    onDragStart();
    setDragStart({
      x: e.clientX - field.x * zoom,
      y: e.clientY - field.y * zoom
    });
  }, [field.x, field.y, onSelect, onDragStart, zoom]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    onSelect();
    
    setIsResizing(true);
    setResizeDirection(direction);
    onDragStart();
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: field.width,
      height: field.height
    });
  }, [field.width, field.height, onSelect, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      onUpdate({ x: Math.max(0, newX), y: Math.max(0, newY) });
    } else if (isResizing) {
      const deltaX = (e.clientX - resizeStart.x) / zoom;
      const deltaY = (e.clientY - resizeStart.y) / zoom;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = field.x;
      let newY = field.y;

      switch (resizeDirection) {
        case 'nw': // Top-left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newX = field.x + (resizeStart.width - newWidth);
          newY = field.y + (resizeStart.height - newHeight);
          break;
        case 'ne': // Top-right
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = field.y + (resizeStart.height - newHeight);
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          newX = field.x + (resizeStart.width - newWidth);
          break;
        case 'se': // Bottom-right
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
      }

      onUpdate({ 
        x: Math.max(0, newX), 
        y: Math.max(0, newY), 
        width: newWidth, 
        height: newHeight 
      });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeDirection, onUpdate, zoom, field.x, field.y]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection('');
      onDragEnd();
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

  const handleAutoResize = useCallback((content: string) => {
    if (field.type === 'text' || field.type === 'paragraph') {
      // Create a temporary element to measure text dimensions
      const tempElement = document.createElement(field.type === 'text' ? 'input' : 'textarea');
      tempElement.style.cssText = `
        position: absolute;
        visibility: hidden;
        height: auto;
        width: auto;
        white-space: ${field.type === 'text' ? 'nowrap' : 'pre-wrap'};
        font-size: ${field.properties.fontSize}px;
        font-weight: ${field.properties.bold ? 'bold' : 'normal'};
        font-style: ${field.properties.italic ? 'italic' : 'normal'};
        padding: 4px 8px;
        border: ${field.properties.borderWidth}px solid ${field.properties.borderColor};
        font-family: inherit;
      `;
      
      if (field.type === 'text') {
        (tempElement as HTMLInputElement).value = content;
      } else {
        (tempElement as HTMLTextAreaElement).value = content;
      }
      
      document.body.appendChild(tempElement);
      
      const minWidth = 120;
      const minHeight = field.type === 'text' ? 32 : 60;
      const padding = 16; // Extra padding for comfort
      
      let newWidth = Math.max(minWidth, tempElement.scrollWidth + padding);
      let newHeight = Math.max(minHeight, tempElement.scrollHeight + padding);
      
      document.body.removeChild(tempElement);
      
      // Only resize if content requires more space
      if (newWidth > field.width || newHeight > field.height) {
        onUpdate({ 
          width: Math.max(field.width, newWidth), 
          height: Math.max(field.height, newHeight) 
        });
      }
    }
  }, [field, onUpdate]);

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
      borderRadius: '2px',
      pointerEvents: 'auto' as const // Allow interaction for editing
    };

    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={properties.hasDefaultText ? '' : (properties.placeholder || `Enter ${type}`)}
            className="resize-none"
            style={style}
            value={properties.value || (properties.hasDefaultText && properties.defaultText ? properties.defaultText : '')}
            onChange={(e) => {
              onUpdate({ properties: { ...properties, value: e.target.value } });
              handleAutoResize(e.target.value);
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when editing
          />
        );
      
      case 'paragraph':
        return (
          <textarea
            placeholder={properties.hasDefaultText ? '' : (properties.placeholder || `Enter ${type}`)}
            className="resize-none"
            style={style}
            value={properties.value || (properties.hasDefaultText && properties.defaultText ? properties.defaultText : '')}
            onChange={(e) => {
              onUpdate({ properties: { ...properties, value: e.target.value } });
              handleAutoResize(e.target.value);
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when editing
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex flex-col h-full justify-center space-y-1">
            {properties.checkboxOptions?.map((option, index) => (
              <div key={index} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={properties.defaultCheckedOption === option.label}
                  readOnly 
                />
                <span style={{ fontSize: `${properties.fontSize}px` }}>
                  {option.label}
                </span>
              </div>
            )) || (
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" readOnly />
                <span style={{ fontSize: `${properties.fontSize}px` }}>Checkbox</span>
              </div>
            )}
          </div>
        );
      
      case 'radio':
        return (
          <div className="flex items-center h-full">
            <input type="radio" className="mr-2" readOnly />
            <span style={{ fontSize: `${properties.fontSize}px` }}>
              {properties.hasDefaultText && properties.defaultText ? properties.defaultText : 'Radio Option'}
            </span>
          </div>
        );
      
      case 'dropdown':
        return (
          <select style={style} disabled value={properties.hasDefaultText && properties.defaultText ? properties.defaultText : ''}>
            <option value="">{properties.hasDefaultText && properties.defaultText ? properties.defaultText : 'Select an option'}</option>
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
      className={`absolute ${isResizing ? 'cursor-nw-resize' : 'cursor-move'} ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'} ${isDragging || isResizing ? 'opacity-75' : ''}`}
      style={{
        left: field.x,
        top: field.y,
        width: field.width,
        height: field.height,
        zIndex: isSelected ? 10 : (isDragging || isResizing) ? 9 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {renderFieldContent()}
      
      {isSelected && (
        <>
          {/* Selection Handles */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          ></div>
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          ></div>
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          ></div>
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          >
            <Resize className="w-2 h-2 text-white" />
          </div>
          


          {/* Question Display */}
          {field.properties.question && (
            <div className="absolute -top-20 left-0 bg-green-700 text-white text-xs px-3 py-2 rounded-lg max-w-sm whitespace-normal shadow-lg border-2 border-green-500 z-20">
              <div className="font-semibold text-green-100 mb-1">Question:</div>
              <div className="text-white leading-relaxed">{field.properties.question}</div>
              <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-700 transform translate-y-full"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};