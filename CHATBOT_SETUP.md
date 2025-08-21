# 🤖 Docfly Chatbot System Setup Guide

## Overview

The Docfly Chatbot System allows users to:
1. **Create forms** in Docfly by placing fields on PDFs
2. **Export form structure** as JSON
3. **Fill forms interactively** through a chatbot interface
4. **Store completed forms** with user answers

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./start_chatbot_system.sh
```

### Option 2: Manual Setup

#### 1. Start Python Backend
```bash
cd chatbot_backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_server.py
```

#### 2. Start React Frontend
```bash
# In a new terminal, from the main directory
npm install
npm run dev
```

## 📱 How to Use

### Step 1: Create Forms in Docfly
1. **Upload a PDF** to Docfly
2. **Add form fields** (text, checkbox, radio, etc.)
3. **Set properties**:
   - **Placeholder**: Hint text for users
   - **Question**: What you're asking the user
   - **Default Text**: Pre-filled values (optional)

### Step 2: Export and Test
1. **Download → Download Form JSON**
   - Automatically uploads to chatbot backend
   - Also downloads JSON file locally
2. **Click "Form Assistant"** button
3. **Select your form** from the list
4. **Answer questions** interactively

### Step 3: Review Results
- **Completed forms** saved in `chatbot_backend/completed_forms/`
- **Console logs** show detailed form data
- **Progress tracking** during form filling

## 🎯 Features

### Docfly (Form Builder)
- ✅ **Drag & drop** form fields
- ✅ **Resize fields** manually and automatically
- ✅ **Set placeholders** and questions
- ✅ **Default text** functionality
- ✅ **Export to JSON** with proper structure

### Chatbot (Form Filler)
- ✅ **Interactive chat** interface
- ✅ **Multiple question types** (text input, multiple choice)
- ✅ **Progress tracking** with visual indicators
- ✅ **Session management** across questions
- ✅ **Answer storage** and form completion
- ✅ **Beautiful UI** with animations

### Backend (API)
- ✅ **RESTful API** with FastAPI
- ✅ **Form management** and storage
- ✅ **Session handling** for multiple users
- ✅ **Auto-documentation** at `/docs`
- ✅ **CORS enabled** for frontend integration

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Welcome message |
| GET | `/api/forms` | List available forms |
| GET | `/api/start_fill_form/{form_name}` | Start form session |
| POST | `/api/chat_response` | Submit answer, get next question |
| POST | `/api/upload_form` | Upload new form JSON |
| GET | `/api/health` | System health check |

## 📁 Directory Structure

```
Docfly/
├── src/                          # React frontend
│   ├── components/
│   │   ├── Chatbot.tsx          # Main chatbot interface
│   │   └── ...                  # Other Docfly components
│   └── ...
├── chatbot_backend/             # Python backend
│   ├── chatbot_api.py          # FastAPI application
│   ├── forms/                  # Form JSON files
│   │   └── sample_form.json    # Example form
│   ├── completed_forms/        # Completed forms with answers
│   └── requirements.txt        # Python dependencies
├── start_chatbot_system.sh     # Quick start script
└── API_test_cases.py           # Test cases
```

## 🧪 Testing

### Test the API
```bash
python API_test_cases.py
```

### Test Form Flow
1. **Create a simple form** in Docfly
2. **Export as JSON**
3. **Open Form Assistant**
4. **Complete the form**
5. **Check `completed_forms/` directory**

## 🔗 URLs

- **Docfly Frontend**: http://localhost:5173
- **Chatbot Backend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Alternative Docs**: http://localhost:8000/redoc

## 🐛 Troubleshooting

### Backend won't start
- Check Python 3 is installed: `python3 --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is free: `lsof -i :8000`

### Frontend won't start
- Check Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check port 5173 is free: `lsof -i :5173`

### Chatbot can't connect
- Ensure backend is running at http://localhost:8000
- Check browser console for CORS errors
- Verify API health: http://localhost:8000/api/health

### Forms not appearing
- Check `chatbot_backend/forms/` directory has JSON files
- Verify JSON format matches expected structure
- Check backend logs for loading errors

## 📝 JSON Format

Expected form JSON structure:
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

## 🎉 Success!

You now have a complete form creation and filling system with:
- **Visual form builder** (Docfly)
- **Interactive chatbot** (Form Assistant)
- **Automated workflow** (JSON export → Chatbot import)
- **Answer storage** (Completed forms)

Happy form building! 🚀
