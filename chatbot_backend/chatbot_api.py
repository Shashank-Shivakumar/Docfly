from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import os
from pathlib import Path

app = FastAPI(title="Docfly Chatbot API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],  # Vite and React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class ChatResponse(BaseModel):
    current_id: str  # This will now represent the form_feild value
    answer: str

class FormMapping(BaseModel):
    form_id: str
    mapping_data: List[Dict[str, Any]]

# Global storage for form data and user sessions
form_data_storage = {}
user_sessions = {}

# Load form data from JSON files
def load_form_data():
    """Load all JSON form files from the forms directory"""
    forms_dir = Path("forms")
    forms_dir.mkdir(exist_ok=True)
    
    for json_file in forms_dir.glob("*.json"):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                form_data = json.load(f)
                form_name = json_file.stem
                form_data_storage[form_name] = form_data
                print(f"Loaded form: {form_name} with {len(form_data)} fields")
        except Exception as e:
            print(f"Error loading {json_file}: {e}")

# Initialize form data on startup
@app.on_event("startup")
async def startup_event():
    load_form_data()
    print(f"Loaded {len(form_data_storage)} forms")

@app.get("/api/")
async def index():
    """Welcome endpoint"""
    return {"message": "Welcome to the FastAPI App with Azure AD Authentication!"}

@app.get("/api/forms")
async def get_available_forms():
    """Get list of available forms"""
    return {
        "forms": list(form_data_storage.keys()),
        "count": len(form_data_storage)
    }

@app.get("/api/start_fill_form/{form_name}")
async def start_fill_form(form_name: str):
    """Start filling a form - returns the first question"""
    if form_name not in form_data_storage:
        raise HTTPException(status_code=404, detail=f"Form '{form_name}' not found")
    
    form_data = form_data_storage[form_name]
    if not form_data:
        raise HTTPException(status_code=400, detail="Form is empty")
    
    print(f"🚀 Starting form: {form_name}")
    print(f"📊 Form has {len(form_data)} questions")
    
    # Get the first question
    first_question = form_data[0]
    print(f"❓ First question: {first_question.get('display_text', 'Unknown')}")
    
    # Initialize user session
    session_id = f"{form_name}_session"
    user_sessions[session_id] = {
        "form_name": form_name,
        "current_index": 0,
        "answers": {},
        "form_data": form_data.copy()
    }
    
    print(f"✅ Created session: {session_id}")
    print(f"📝 Available sessions: {list(user_sessions.keys())}")
    
    return {
        "type": "question",
        "body": first_question,
        "session_id": session_id,
        "progress": {
            "current": 1,
            "total": len(form_data)
        }
    }

@app.post("/api/chat_response")
async def chat_response(response: ChatResponse):
    """Process user's answer and return next question or completion"""
    current_id = response.current_id
    answer = response.answer
    
    print(f"🔍 Processing answer for question ID: {current_id}")
    print(f"📝 Answer: {answer}")
    
    # Find the session that contains this question ID
    session_id = None
    current_question_index = None
    
    for sid, session in user_sessions.items():
        form_data = session["form_data"]
        for i, item in enumerate(form_data):
            if item["form_feild"] == current_id:
                session_id = sid
                current_question_index = i
                break
        if session_id:
            break
    
    if not session_id:
        print(f"❌ No session found for question ID: {current_id}")
        raise HTTPException(status_code=404, detail="Session not found for the given question ID")
    
    print(f"✅ Found session: {session_id}, current question index: {current_question_index}")
    
    session = user_sessions[session_id]
    form_data = session["form_data"]
    
    # Store the answer
    session["answers"][current_id] = answer
    
    # Update the form data with the answer
    for item in form_data:
        if item["form_feild"] == current_id:
            item["answer"] = answer
            break
    
    # Move to next question
    next_index = current_question_index + 1
    
    print(f"📊 Progress: {next_index + 1}/{len(form_data)}")
    
    if next_index >= len(form_data):
        # Form completed
        print(f"🎉 Form completed! Saving results...")
        completed_form = session["form_data"]
        
        # Save completed form
        save_completed_form(session["form_name"], completed_form)
        
        return {
            "type": "complete_message",
            "message": "Thank you! You have completed the form successfully.",
            "answers_summary": session["answers"]
        }
    
    # Get next question
    next_question = form_data[next_index]
    print(f"➡️ Next question: {next_question.get('display_text', 'Unknown question')}")
    
    return {
        "type": "question",
        "body": next_question,
        "progress": {
            "current": next_index + 1,
            "total": len(form_data)
        }
    }

@app.post("/api/create_form_mapping")
async def create_form_mapping(mapping: FormMapping):
    """Create or update form mapping"""
    try:
        # Save the mapping data
        forms_dir = Path("forms")
        forms_dir.mkdir(exist_ok=True)
        
        mapping_file = forms_dir / f"{mapping.form_id}.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(mapping.mapping_data, f, indent=2, ensure_ascii=False)
        
        # Reload form data
        load_form_data()
        
        return {"success": True, "message": "Form mapping created successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating form mapping: {str(e)}")

@app.post("/api/upload_form")
async def upload_form(form_data: Dict[str, Any]):
    """Upload a new form JSON"""
    try:
        print(f"📥 Received upload request: {form_data}")
        
        form_name = form_data.get("form_name", "uploaded_form")
        fields = form_data.get("fields", [])
        
        print(f"📝 Form name: {form_name}")
        print(f"📊 Fields count: {len(fields)}")
        
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided")
        
        forms_dir = Path("forms")
        forms_dir.mkdir(exist_ok=True)
        
        form_file = forms_dir / f"{form_name}.json"
        with open(form_file, 'w', encoding='utf-8') as f:
            json.dump(fields, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved form to: {form_file}")
        
        # Reload form data
        load_form_data()
        
        return {"success": True, "message": f"Form '{form_name}' uploaded successfully."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error uploading form: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading form: {str(e)}")

def save_completed_form(form_name: str, completed_form: List[Dict]):
    """Save completed form with answers"""
    try:
        completed_dir = Path("completed_forms")
        completed_dir.mkdir(exist_ok=True)
        
        # Add timestamp to filename
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{form_name}_completed_{timestamp}.json"
        
        completed_file = completed_dir / filename
        with open(completed_file, 'w', encoding='utf-8') as f:
            json.dump(completed_form, f, indent=2, ensure_ascii=False)
        
        print(f"Saved completed form: {filename}")
    except Exception as e:
        print(f"Error saving completed form: {e}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "forms_loaded": len(form_data_storage),
        "active_sessions": len(user_sessions)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
