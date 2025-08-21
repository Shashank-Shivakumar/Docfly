import React from 'react';
import { FormField } from '../types';
import { Type, CheckSquare, List, Calendar, FileText, PenTool, User } from 'lucide-react';

interface FieldsListProps {
  fields: FormField[];
  onFieldSelect: (field: FormField) => void;
  selectedFieldId: string | null;
}

const getFieldIcon = (type: FormField['type']) => {
  switch (type) {
    case 'text':
      return <Type className="w-4 h-4" />;
    case 'paragraph':
      return <FileText className="w-4 h-4" />;
    case 'checkbox':
      return <CheckSquare className="w-4 h-4" />;
    case 'radio':
      return <List className="w-4 h-4" />;
    case 'dropdown':
      return <List className="w-4 h-4" />;
    case 'date':
      return <Calendar className="w-4 h-4" />;
    case 'signature':
      return <PenTool className="w-4 h-4" />;
    case 'initials':
      return <User className="w-4 h-4" />;
    default:
      return <Type className="w-4 h-4" />;
  }
};

const getFieldTypeLabel = (type: FormField['type']) => {
  switch (type) {
    case 'text':
      return 'Text Field';
    case 'paragraph':
      return 'Paragraph';
    case 'checkbox':
      return 'Checkbox Group';
    case 'radio':
      return 'Radio Group';
    case 'dropdown':
      return 'Dropdown';
    case 'date':
      return 'Date Field';
    case 'signature':
      return 'Signature';
    case 'initials':
      return 'Initials';
    default:
      return type;
  }
};

export const FieldsList: React.FC<FieldsListProps> = ({
  fields,
  onFieldSelect,
  selectedFieldId
}) => {
  const configuredFields = fields.filter(field => field.isConfigured);
  const unconfiguredFields = fields.filter(field => !field.isConfigured);

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
        <p className="text-sm text-gray-600 mt-1">
          {fields.length} total fields • {configuredFields.length} configured
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Configured Fields */}
        {configuredFields.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Configured Fields
            </h4>
            <div className="space-y-2">
              {configuredFields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => onFieldSelect(field)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFieldId === field.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {getFieldIcon(field.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {field.properties.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getFieldTypeLabel(field.type)}
                      </div>
                      {field.properties.question && (
                        <div className="text-xs text-gray-600 mt-1 truncate">
                          Q: {field.properties.question}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unconfigured Fields */}
        {unconfiguredFields.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Pending Configuration
            </h4>
            <div className="space-y-2">
              {unconfiguredFields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => onFieldSelect(field)}
                  className="p-3 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-orange-500">
                      {getFieldIcon(field.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {field.properties.name}
                      </div>
                      <div className="text-xs text-orange-600">
                        Click to configure
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Fields Message */}
        {fields.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Type className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No Fields Yet</p>
            <p className="text-sm">Add fields to your PDF to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
