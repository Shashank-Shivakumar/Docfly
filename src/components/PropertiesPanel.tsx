import React from 'react';
import { FormField } from '../types';
import { X, Settings, Type, Palette } from 'lucide-react';

interface PropertiesPanelProps {
  selectedField: FormField | null;
  allFields: FormField[];
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedField,
  allFields,
  onFieldUpdate,
  onFieldDelete,
  onClose
}) => {
  if (!selectedField) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full p-6">
        <div className="text-center text-gray-500 mt-8">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No Field Selected</p>
          <p className="text-sm">Select a form field to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateProperty = (key: string, value: any) => {
    onFieldUpdate(selectedField.id, {
      properties: { ...selectedField.properties, [key]: value }
    });
  };

  const updateField = (key: string, value: any) => {
    onFieldUpdate(selectedField.id, { [key]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Type className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Field Properties</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Properties */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
            <input
              type="text"
              value={selectedField.properties.name}
              onChange={(e) => updateProperty('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
            <input
              type="text"
              value={selectedField.properties.placeholder || ''}
              onChange={(e) => updateProperty('placeholder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={selectedField.properties.required}
              onChange={(e) => updateProperty('required', e.target.checked)}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700">
              Required Field
            </label>
          </div>

          {selectedField.type === 'text' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="combed"
                checked={selectedField.properties.combed || false}
                onChange={(e) => updateProperty('combed', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="combed" className="text-sm font-medium text-gray-700">
                Combed (Character Boxes)
              </label>
            </div>
          )}

          {selectedField.properties.combed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Character Count</label>
              <input
                type="number"
                value={selectedField.properties.combedLength || 10}
                onChange={(e) => updateProperty('combedLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="50"
              />
            </div>
          )}
        </div>

        {/* Dropdown/Radio Options */}
        {(selectedField.type === 'dropdown' || selectedField.type === 'radio') && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Options</h4>
            <div className="space-y-2">
              {selectedField.properties.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(selectedField.properties.options || [])];
                      newOptions[index] = e.target.value;
                      updateProperty('options', newOptions);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newOptions = selectedField.properties.options?.filter((_, i) => i !== index);
                      updateProperty('options', newOptions);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(selectedField.properties.options || []), `Option ${(selectedField.properties.options?.length || 0) + 1}`];
                  updateProperty('options', newOptions);
                }}
                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {/* Question Properties */}
        {selectedField.type === 'question' && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Question</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <textarea
                value={selectedField.properties.questionText || ''}
                onChange={(e) => updateProperty('questionText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter your question here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Text Field</label>
              <select
                value={selectedField.properties.relatedFieldId || ''}
                onChange={(e) => updateProperty('relatedFieldId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a text field...</option>
                {allFields
                  .filter(field => field.type === 'text' || field.type === 'paragraph')
                  .map(field => (
                    <option key={field.id} value={field.id}>
                      {field.properties.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a text field to display this question above it
              </p>
            </div>
          </div>
        )}

        {/* Appearance */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
            <Palette className="w-4 h-4 mr-1" />
            Appearance
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
            <input
              type="number"
              value={selectedField.properties.fontSize}
              onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="8"
              max="72"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bold"
                checked={selectedField.properties.bold}
                onChange={(e) => updateProperty('bold', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="bold" className="text-sm font-medium text-gray-700">Bold</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="italic"
                checked={selectedField.properties.italic}
                onChange={(e) => updateProperty('italic', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="italic" className="text-sm font-medium text-gray-700">Italic</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedField.properties.backgroundColor === 'transparent' ? '#ffffff' : selectedField.properties.backgroundColor}
                onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <button
                onClick={() => updateProperty('backgroundColor', 'transparent')}
                className={`px-3 py-1 text-xs rounded ${
                  selectedField.properties.backgroundColor === 'transparent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Transparent
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
            <input
              type="color"
              value={selectedField.properties.borderColor}
              onChange={(e) => updateProperty('borderColor', e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Width</label>
            <input
              type="range"
              min="0"
              max="5"
              value={selectedField.properties.borderWidth}
              onChange={(e) => updateProperty('borderWidth', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{selectedField.properties.borderWidth}px</span>
          </div>
        </div>

        {/* Position & Size */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Position & Size</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedField.x)}
                onChange={(e) => updateField('x', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedField.y)}
                onChange={(e) => updateField('y', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedField.width)}
                onChange={(e) => updateField('width', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedField.height)}
                onChange={(e) => updateField('height', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onFieldDelete(selectedField.id)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Field
          </button>
        </div>
      </div>
    </div>
  );
};