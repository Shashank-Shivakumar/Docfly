export interface FormField {
  id: string;
  type: 'text' | 'paragraph' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'signature' | 'initials';
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  isConfigured: boolean; // Track if field has been configured
  properties: {
    name: string;
    placeholder?: string;
    hasDefaultText: boolean;
    defaultText?: string;
    question?: string;
    required: boolean;
    combed?: boolean;
    combedLength?: number;
    fontSize: number;
    bold: boolean;
    italic: boolean;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    options?: string[]; // for dropdown, radio
    value?: string;
    // New checkbox properties
    checkboxOptions?: CheckboxOption[];
    defaultCheckedOption?: string;
  };
}

export interface CheckboxOption {
  label: string;
  field: string;
  field_value: string;
  default_checked?: boolean;
}

export interface PDFDocument {
  id: string;
  name: string;
  file: File | null;
  pages: number;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
}