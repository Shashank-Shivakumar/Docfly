# Docfly Chatbot Backend

A FastAPI-based chatbot backend that processes form JSONs exported from Docfly and conducts interactive form filling sessions.

## Features

- 🤖 Interactive chatbot for form filling
- 📝 Supports multiple question types (input_text, check_list)
- 💾 Automatic answer storage and form completion
- 🔄 Session management with progress tracking
- 📊 REST API with automatic documentation

## Installation

1. **Install Python dependencies:**
```bash
cd chatbot_backend
pip install -r requirements.txt
```

2. **Create required directories:**
```bash
mkdir forms completed_forms
```

3. **Add your form JSON files to the `forms` directory**

## Running the Server

### Option 1: Using the run script
```bash
python run_server.py
```

### Option 2: Using uvicorn directly
```bash
uvicorn chatbot_api:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `GET /api/` - Welcome message
- `GET /api/forms` - List available forms
- `GET /api/start_fill_form/{form_name}` - Start filling a form
- `POST /api/chat_response` - Submit answer and get next question
- `POST /api/create_form_mapping` - Upload new form mapping
- `POST /api/upload_form` - Upload form JSON
- `GET /api/health` - Health check

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Directory Structure

```
chatbot_backend/
├── chatbot_api.py          # Main FastAPI application
├── requirements.txt        # Python dependencies
├── run_server.py          # Server startup script
├── forms/                 # Form JSON files
│   └── sample_form.json   # Example form
└── completed_forms/       # Completed forms with answers
```

## Form JSON Format

The chatbot expects JSON files in this format:

```json
[
  {
    "display_text": "Enter your name",
    "type": "input_text",
    "form_feild": "name_field",
    "_id": "form§1",
    "next_question": "form§2",
    "previous_question": null,
    "question": "What is your full name?",
    "answer": ""
  }
]
```

## Testing

Run the test cases:
```bash
python ../API_test_cases.py
```

## Integration with Docfly

1. **Export JSON from Docfly** using "Download Form JSON"
2. **Place the JSON file** in the `forms/` directory
3. **Start the chatbot** from Docfly's "Form Assistant" button
4. **Select the form** and begin interactive filling

## Completed Forms

Completed forms are automatically saved to `completed_forms/` with timestamps and include all user answers.
