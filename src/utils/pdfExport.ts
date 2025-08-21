import { PDFDocument as PDFLibDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFForm, rgb } from 'pdf-lib';
import { FormField, PDFDocument } from '../types';

// Generate unique ID for form fields
const generateUniqueId = (baseId: string, index: number): string => {
  return `${baseId}§${index + 1}`;
};

// Generate random string for field values
const generateRandomString = (length: number = 4): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const exportFormJSON = (document: PDFDocument): string => {
  if (!document.file) {
    throw new Error('No PDF file loaded');
  }
  
  const formJson = document.fields.map((field) => {
    // Get the field value (current value or default text)
    const fieldValue = field.properties.value || (field.properties.hasDefaultText && field.properties.defaultText ? field.properties.defaultText : '');
    
    // Use question as display_text if available, otherwise use placeholder
    const displayText = field.properties.question || field.properties.placeholder || `Enter ${field.type}`;
    
    let jsonField: any = {
      display_text: displayText,
      answer: fieldValue || ""
    };

    // Handle different field types
    if (field.type === 'checkbox' && field.properties.checkboxOptions) {
      // Create the new checkbox format
      const checkboxOptions: any = {};
      
      field.properties.checkboxOptions.forEach((option) => {
        checkboxOptions[option.label] = [{
          label: option.label,
          field: option.field,
          field_value: option.field_value,
          default_checked: field.properties.defaultCheckedOption === option.label
        }];
      });
      
      jsonField.type = "check_list";
      jsonField.form_feild = checkboxOptions;
    } else {
      // For other field types, use the simple format
      jsonField.type = "input_text";
      jsonField.form_feild = field.properties.name;
    }

    return jsonField;
  });

  return JSON.stringify(formJson, null, 2);
};

export const exportFillablePDF = async (document: PDFDocument): Promise<Uint8Array> => {
  if (!document.file) {
    throw new Error('No PDF file loaded');
  }
  //Form fields Format.
  function extractFieldsJson(fields: FormField[]) {
  return fields.map(field => ({
    display_text: field.properties.question,
    type: field.type,
    form_field: field.properties.name
  }));
}
  try {
    // Read the original PDF
    const arrayBuffer = await document.file.arrayBuffer();
    const pdfDoc = await PDFLibDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    // Add form fields
    for (const field of document.fields) {
      await addFormFieldToPDF(form, field, pdfDoc);
    }

    const fieldsJson = extractFieldsJson(document.fields);
    const filename = `${document.name.replace('.pdf', '')}`;
    // await fetch('http://localhost:8000/api/create_form_mapping', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ form_id: filename, mapping_data: fieldsJson }),
    // });
    console.log('Fields JSON:', fieldsJson);
    console.log('File Name:', filename);

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
      await addFormFieldToPDF(form, field, pdfDoc);
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

const addFormFieldToPDF = async (form: PDFForm, field: FormField, pdfDoc: PDFLibDocument) => {
  const pages = pdfDoc.getPages();
  const page = pages[field.pageNumber - 1];
  
  if (!page) return;

  const { x, y, width, height, properties } = field;
  
  // Debug: Log the field dimensions
  console.log(`Adding field ${properties.name}:`, { 
    x, y, width, height, type: field.type,
    checkboxOptions: properties.checkboxOptions,
    defaultCheckedOption: properties.defaultCheckedOption
  });
  
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
        
        // Set the field value - use current value or default text as actual value
        const fieldValue = properties.value || (properties.hasDefaultText && properties.defaultText ? properties.defaultText : '');
        if (fieldValue) {
          textField.setText(fieldValue);
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
        if (properties.checkboxOptions && properties.checkboxOptions.length > 0) {
          // SIMPLIFIED: Create clean, non-overlapping checkboxes
          const totalOptions = properties.checkboxOptions.length;
          
          // Use fixed, small dimensions to prevent overlap
          const checkboxSize = 12; // Small, readable size
          const spacing = 30; // Generous spacing between options
          
          console.log(`Creating ${totalOptions} checkboxes for field ${properties.name}`);
          
          properties.checkboxOptions.forEach((option, index) => {
            try {
              // Create checkbox
              const checkbox = form.createCheckBox(`${properties.name}_${index}`);
              const checkboxX = x + (index * spacing);
              
              checkbox.addToPage(page, {
                x: checkboxX,
                y: pdfY,
                width: checkboxSize,
                height: checkboxSize,
                borderColor: parseColor(properties.borderColor),
                borderWidth: 1,
              });
              
              // Set default checked state
              console.log(`Checkbox ${index} (${option.label}): default_checked = ${option.default_checked}`);
              if (option.default_checked) {
                console.log(`Setting ${option.label} as checked`);
                checkbox.check();
              }
              
              // Create text label below checkbox
              const textField = form.createTextField(`${properties.name}_${index}_label`);
              textField.addToPage(page, {
                x: checkboxX - 5, // Center text under checkbox
                y: pdfY - checkboxSize - 5, // Below checkbox
                width: checkboxSize + 10, // Slightly wider than checkbox
                height: 10, // Small height for text
              });
              textField.setText(option.label);
              textField.enableReadOnly();
              
              console.log(`Created checkbox ${index}: ${option.label} at (${checkboxX}, ${pdfY})`);
            } catch (error) {
              console.error(`Failed to create checkbox ${index}:`, error);
            }
          });
        } else {
          // Fallback for legacy checkbox without options
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
        }
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
      case 'initials':
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
    }
  } catch (error) {
    console.warn(`Failed to add field ${field.properties.name}:`, error);
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

