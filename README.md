# PDF Form Builder

A modern React-based PDF form builder application with TypeScript and Vite.

## Features

- ✅ Upload and view PDF documents
- ✅ Add form fields (text, paragraph, checkbox, radio, dropdown, date, signature, initials)
- ✅ Real-time field property editing
- ✅ **NEW: Question/Help Text for Fields** - Add contextual questions or descriptions to form fields
- ✅ Drag and drop field positioning
- ✅ Field resizing and styling options
- ✅ Export fillable or flattened PDFs
- ✅ Undo/Redo functionality
- ✅ Page navigation and thumbnails

## New Question Feature

When editing form fields, you can now add questions or help text that will:
- Appear above the field when it's selected
- Help users understand what information to enter
- Provide context and guidance for form completion

### How to Use:
1. Click on any text field or form element
2. In the Properties Panel (right pane), find the "Question" field
3. Enter your question or description
4. The question will appear above the field when selected, with a green tooltip-style display

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```