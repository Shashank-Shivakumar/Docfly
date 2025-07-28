import { PDFDocument as PDFLibDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFForm, rgb } from 'pdf-lib';
import { FormField, PDFDocument } from '../types';

export const exportFillablePDF = async (document: PDFDocument): Promise<Uint8Array> => {
  if (!document.file) {
    throw new Error('No PDF file loaded');
  }

  try {
    // Read the original PDF
    const arrayBuffer = await document.file.arrayBuffer();
    const pdfDoc = await PDFLibDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    // Add form fields
    for (const field of document.fields) {
      await addFormFieldToPDF(form, field, pdfDoc, document.fields);
    }

    // Save the PDF
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error exporting fillable PDF:', error);
    throw new Error('Failed to export fillable PDF');
  }
};

export const exportFlattenedPDF = async (document: PDFDocument): Promise<Uint8Array> => {
  if (!document.file) {
    throw new Error('No PDF file loaded');
  }

  try {
    // Read the original PDF
    const arrayBuffer = await document.file.arrayBuffer();
    const pdfDoc = await PDFLibDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    // Add form fields
    for (const field of document.fields) {
      await addFormFieldToPDF(form, field, pdfDoc, document.fields);
    }

    // Flatten the form (make fields non-interactive)
    form.flatten();

    // Save the PDF
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error exporting flattened PDF:', error);
    throw new Error('Failed to export flattened PDF');
  }
};

const addFormFieldToPDF = async (form: PDFForm, field: FormField, pdfDoc: PDFLibDocument, allFields: FormField[]) => {
  const pages = pdfDoc.getPages();
  const page = pages[field.pageNumber - 1];
  
  if (!page) return;

  const { x, y, width, height, properties } = field;
  
  // Convert coordinates (PDF coordinate system is bottom-left origin)
  const pageHeight = page.getHeight();
  const pdfY = pageHeight - y - height;

  try {
    switch (field.type) {
      case 'text':
      case 'paragraph':
        const textField = form.createTextField(properties.name);
        textField.addToPage(page, {
          x,
          y: pdfY,
          width,
          height,
          backgroundColor: properties.backgroundColor !== 'transparent' 
            ? parseColor(properties.backgroundColor) 
            : undefined,
          borderColor: parseColor(properties.borderColor),
          borderWidth: properties.borderWidth,
        });
        
        if (properties.placeholder) {
          textField.setText(properties.placeholder);
        }
        
        if (field.type === 'paragraph') {
          textField.enableMultiline();
        }
        
        if (properties.combed && properties.combedLength) {
          textField.enableCombing();
          textField.setMaxLength(properties.combedLength);
        }
        break;

      case 'checkbox':
        const checkbox = form.createCheckBox(properties.name);
        checkbox.addToPage(page, {
          x,
          y: pdfY,
          width: Math.min(width, height),
          height: Math.min(width, height),
          backgroundColor: properties.backgroundColor !== 'transparent' 
            ? parseColor(properties.backgroundColor) 
            : undefined,
          borderColor: parseColor(properties.borderColor),
          borderWidth: properties.borderWidth,
        });
        break;

      case 'dropdown':
        if (properties.options && properties.options.length > 0) {
          const dropdown = form.createDropdown(properties.name);
          dropdown.addToPage(page, {
            x,
            y: pdfY,
            width,
            height,
            backgroundColor: properties.backgroundColor !== 'transparent' 
              ? parseColor(properties.backgroundColor) 
              : undefined,
            borderColor: parseColor(properties.borderColor),
            borderWidth: properties.borderWidth,
          });
          dropdown.addOptions(properties.options);
        }
        break;

      case 'radio':
        if (properties.options && properties.options.length > 0) {
          const radioGroup = form.createRadioGroup(properties.name);
          properties.options.forEach((option, index) => {
            radioGroup.addOptionToPage(option, page, {
              x: x + (index * (width + 10)),
              y: pdfY,
              width: Math.min(width / properties.options!.length, height),
              height: Math.min(width / properties.options!.length, height),
              backgroundColor: properties.backgroundColor !== 'transparent' 
                ? parseColor(properties.backgroundColor) 
                : undefined,
              borderColor: parseColor(properties.borderColor),
              borderWidth: properties.borderWidth,
            });
          });
        }
        break;

      case 'date':
        const dateField = form.createTextField(properties.name);
        dateField.addToPage(page, {
          x,
          y: pdfY,
          width,
          height,
          backgroundColor: properties.backgroundColor !== 'transparent' 
            ? parseColor(properties.backgroundColor) 
            : undefined,
          borderColor: parseColor(properties.borderColor),
          borderWidth: properties.borderWidth,
        });
        break;

      case 'signature':
        const sigField = form.createTextField(properties.name);
        sigField.addToPage(page, {
          x,
          y: pdfY,
          width,
          height,
          backgroundColor: properties.backgroundColor !== 'transparent' 
            ? parseColor(properties.backgroundColor) 
            : undefined,
          borderColor: parseColor(properties.borderColor),
          borderWidth: properties.borderWidth,
        });
        break;

      case 'initials':
        // For initials, we'll create a text field with a dashed border
        const initialsField = form.createTextField(properties.name);
        initialsField.addToPage(page, {
          x,
          y: pdfY,
          width,
          height,
          backgroundColor: properties.backgroundColor !== 'transparent' 
            ? parseColor(properties.backgroundColor) 
            : undefined,
          borderColor: parseColor(properties.borderColor),
          borderWidth: properties.borderWidth,
        });
        break;

      case 'question':
        // For questions, we'll add the question text as a text annotation above the related field
        if (properties.questionText && properties.relatedFieldId) {
          // Find the related field to position the question above it
          const relatedField = allFields.find((f: FormField) => f.id === properties.relatedFieldId);
          if (relatedField) {
            const questionX = relatedField.x;
            const questionY = relatedField.y + relatedField.height + 10; // 10px above the field
            const questionPdfY = pageHeight - questionY;
            
            // Add question text as a text annotation
            page.drawText(properties.questionText, {
              x: questionX,
              y: questionPdfY,
              size: 10,
              color: rgb(0.6, 0.4, 0.2), // Brown color for questions
            });
          }
        }
        break;

      default:
        console.warn(`Unsupported field type: ${field.type}`);
        break;
    }
  } catch (error) {
    console.error(`Error adding field ${field.id} to PDF:`, error);
  }
};

const parseColor = (colorString: string) => {
  // Convert hex color to RGB
  const hex = colorString.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  return rgb(r, g, b);
};

export const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};