import React from 'react';
import { 
  Type, 
  AlignLeft, 
  CheckSquare, 
  Circle, 
  ChevronDown, 
  Calendar, 
  PenTool, 
  Users,
  Save,
  Download,
  Undo,
  Redo,
  Trash2
} from 'lucide-react';

interface ToolbarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string) => void;
  onSave: () => void;
  onDownload: (type: 'fillable' | 'flattened') => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const toolButtons = [
  { id: 'text', icon: Type, label: 'Text Field', group: 'fields' },
  { id: 'paragraph', icon: AlignLeft, label: 'Paragraph Field', group: 'fields' },
  { id: 'checkbox', icon: CheckSquare, label: 'Checkbox', group: 'fields' },
  { id: 'radio', icon: Circle, label: 'Radio Button', group: 'fields' },
  { id: 'dropdown', icon: ChevronDown, label: 'Dropdown', group: 'fields' },
  { id: 'date', icon: Calendar, label: 'Date Field', group: 'fields' },
  { id: 'signature', icon: PenTool, label: 'Signature', group: 'fields' },
  { id: 'initials', icon: Users, label: 'Initials', group: 'fields' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onSave,
  onDownload,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Form Fields Group */}
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-6">
            <span className="text-sm font-medium text-gray-700 mr-3">Form Fields</span>
            {toolButtons.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Edit Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={onClear}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
              title="Clear All Fields"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSave}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
          
          <div className="relative group">
            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Download
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => onDownload('fillable')}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                Fillable PDF
              </button>
              <button
                onClick={() => onDownload('flattened')}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-b-lg"
              >
                Flattened PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};