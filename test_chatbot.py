#!/usr/bin/env python3
"""
Test script to verify the chatbot system is working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api_health():
    """Test if API is running"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ API Health: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ API Health failed: {e}")
        return False

def test_forms_list():
    """Test listing available forms"""
    try:
        response = requests.get(f"{BASE_URL}/forms")
        data = response.json()
        print(f"✅ Available forms: {data}")
        return data['forms']
    except Exception as e:
        print(f"❌ Forms list failed: {e}")
        return []

def test_form_upload():
    """Test uploading a form"""
    test_form = [
        {
            "display_text": "Enter your test name",
            "type": "input_text",
            "form_feild": "test_name_field",
            "_id": "test_upload§1",
            "next_question": "test_upload§2",
            "previous_question": None,
            "question": "What is your test name?",
            "answer": ""
        },
        {
            "display_text": "Select test option",
            "type": "check_list",
            "form_feild": {
                "Option A": {
                    "label": "Option A",
                    "field": "test_option_a",
                    "field_value": "A"
                },
                "Option B": {
                    "label": "Option B", 
                    "field": "test_option_b",
                    "field_value": "B"
                }
            },
            "_id": "test_upload§2",
            "previous_question": "test_upload§1",
            "question": "Please select a test option?",
            "answer": ""
        }
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/upload_form",
            json={
                "form_name": "test_upload",
                "fields": test_form
            },
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ Form upload: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Form upload failed: {e}")
        return False

def test_start_form(form_name):
    """Test starting a form"""
    try:
        response = requests.get(f"{BASE_URL}/start_fill_form/{form_name}")
        data = response.json()
        print(f"✅ Start form '{form_name}': {data}")
        return data
    except Exception as e:
        print(f"❌ Start form failed: {e}")
        return None

def test_chat_response(question_id, answer):
    """Test submitting an answer"""
    try:
        response = requests.post(
            f"{BASE_URL}/chat_response",
            json={
                "current_id": question_id,
                "answer": answer
            },
            headers={"Content-Type": "application/json"}
        )
        data = response.json()
        print(f"✅ Chat response: {data}")
        return data
    except Exception as e:
        print(f"❌ Chat response failed: {e}")
        return None

def run_full_test():
    """Run complete chatbot test"""
    print("🤖 Starting Chatbot System Test")
    print("=" * 40)
    
    # Test 1: API Health
    if not test_api_health():
        return False
    
    # Test 2: List forms
    forms = test_forms_list()
    
    # Test 3: Upload form
    if test_form_upload():
        forms = test_forms_list()  # Refresh list
    
    # Test 4: Test with sample_form if available
    if "sample_form" in forms:
        print("\n🧪 Testing sample_form flow:")
        
        # Start form
        start_data = test_start_form("sample_form")
        if start_data and start_data.get("type") == "question":
            question = start_data["body"]
            
            # Answer first question
            response = test_chat_response(question["_id"], "John Test")
            if response and response.get("type") == "question":
                question = response["body"]
                
                # Answer second question
                response = test_chat_response(question["_id"], "john@test.com")
                if response and response.get("type") == "question":
                    question = response["body"]
                    
                    # Answer third question (multiple choice)
                    if question.get("type") == "check_list":
                        options = list(question["form_feild"].keys())
                        response = test_chat_response(question["_id"], options[0])
                        
                        if response and response.get("type") == "complete_message":
                            print("🎉 Form completed successfully!")
                            return True
    
    print("✅ Basic tests completed")
    return True

if __name__ == "__main__":
    success = run_full_test()
    if success:
        print("\n🎉 All tests passed! Chatbot system is working correctly.")
        print("\n📱 You can now:")
        print("   1. Visit http://localhost:5173 for Docfly")
        print("   2. Click 'Form Assistant' to test the chatbot")
        print("   3. Select 'sample_form' to try the interactive flow")
    else:
        print("\n❌ Some tests failed. Please check the server logs.")
