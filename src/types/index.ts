export interface FormField {
  id: string;
  type: 'text' | 'paragraph' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'signature' | 'initials';
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  properties: {
    name: string;
    placeholder?: string;
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
  };
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