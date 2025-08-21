import React from 'react';
import { FormField } from '../types';
import { X, Settings, Type } from 'lucide-react';

interface PropertiesPanelProps {
  selectedField: FormField | null;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedField,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
              <span className="text-xs text-gray-500 font-normal ml-2">(appears when field is selected)</span>
            </label>
            <textarea
              value={selectedField.properties.question || ''}
              onChange={(e) => updateProperty('question', e.target.value)}
              placeholder="Enter a question or description for this field. This will help users understand what information to enter."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            />
            {selectedField.properties.question && (
              <p className="text-xs text-gray-500 mt-1">
                This question will appear above the field when selected.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="hasDefaultText"
                checked={selectedField.properties.hasDefaultText}
                onChange={(e) => updateProperty('hasDefaultText', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="hasDefaultText" className="text-sm font-medium text-gray-700">
                Set Default Text
              </label>
            </div>
            
            {selectedField.properties.hasDefaultText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Text</label>
                <input
                  type="text"
                  value={selectedField.properties.defaultText || ''}
                  onChange={(e) => updateProperty('defaultText', e.target.value)}
                  placeholder="Enter default text for this field"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This text will appear as the default value in the field.
                </p>
              </div>
            )}
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

        {/* Checkbox Options */}
        {selectedField.type === 'checkbox' && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Checkbox Options</h4>
            
            {/* Default Option Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Checked Option</label>
              <select
                value={selectedField.properties.defaultCheckedOption || ''}
                onChange={(e) => {
                  const selectedOption = e.target.value;
                  updateProperty('defaultCheckedOption', selectedOption);
                  
                  // Update the default_checked property for all options
                  if (selectedField.properties.checkboxOptions) {
                    const updatedOptions = selectedField.properties.checkboxOptions.map(option => ({
                      ...option,
                      default_checked: option.label === selectedOption
                    }));
                    updateProperty('checkboxOptions', updatedOptions);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No default selection</option>
                {selectedField.properties.checkboxOptions?.map((option, index) => (
                  <option key={index} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox Options Management */}
            <div className="space-y-2">
              {selectedField.properties.checkboxOptions?.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...(selectedField.properties.checkboxOptions || [])];
                        newOptions[index] = { ...newOptions[index], label: e.target.value };
                        updateProperty('checkboxOptions', newOptions);
                      }}
                      placeholder="Option label"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newOptions = selectedField.properties.checkboxOptions?.filter((_, i) => i !== index);
                        updateProperty('checkboxOptions', newOptions);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.field}
                      onChange={(e) => {
                        const newOptions = [...(selectedField.properties.checkboxOptions || [])];
                        newOptions[index] = { ...newOptions[index], field: e.target.value };
                        updateProperty('checkboxOptions', newOptions);
                      }}
                      placeholder="Field name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      value={option.field_value}
                      onChange={(e) => {
                        const newOptions = [...(selectedField.properties.checkboxOptions || [])];
                        newOptions[index] = { ...newOptions[index], field_value: e.target.value };
                        updateProperty('checkboxOptions', newOptions);
                      }}
                      placeholder="Field value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(selectedField.properties.checkboxOptions || []), {
                    label: `Option ${(selectedField.properties.checkboxOptions?.length || 0) + 1}`,
                    field: `checkbox_${Date.now()}_${(selectedField.properties.checkboxOptions?.length || 0) + 1}`,
                    field_value: `Yes_${(selectedField.properties.checkboxOptions?.length || 0) + 1}`,
                    default_checked: false
                  }];
                  updateProperty('checkboxOptions', newOptions);
                }}
                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Add Checkbox Option
              </button>
            </div>
          </div>
        )}





        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <button
            onClick={() => onFieldUpdate(selectedField.id, { isConfigured: true })}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Done
          </button>
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