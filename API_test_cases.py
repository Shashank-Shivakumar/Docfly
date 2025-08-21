from fastapi.testclient import TestClient

class TestChatBotAPI:
    def setup_method(self):
        from chatbot_api import app  # Import the FastAPI app
        self.client = TestClient(app)

    def test_index(self):
        print("Running test_index...")
        response = self.client.get("/api/")
        assert response.status_code == 200
        assert response.json() == {"message": "Welcome to the FastAPI App with Azure AD Authentication!"}

    def test_chat_response(self, current_id, answer):
        return self.client.post("/api/chat_response", json={"current_id": current_id, "answer": answer})

    def fill_test_form(self, body):
        print("Started Filling test form...")
        current_id = body["_id"]
        print(body)
        counter = 1
        while True:
            if body['type'] == "check_list":
                answer = list(body["form_feild"].keys())[0]
                # answer = dict_keys[0]
            elif body['type'] == "input_text":
                answer = f"12-12-{2000 +counter}"
                counter += 1
            else:
                answer = f"12-12-{2000 +counter}"
                counter += 1
            # print(f"Current question ID: {current_id}, Answer: {answer}")
            response = self.test_chat_response(current_id, answer)
            assert response.status_code == 200
            data = response.json()
            body = data["body"]
            # Check if we reached the end of the form
            if data.get("type") == 'complete_message':
                print("Reached the end of the form.")
                break
            # Prepare for the next iteration
            current_id = body["_id"]

    def test_start_fill_form(self):
        print("Running test_start_fill_form...")
        form_name = "survey_form"
        response = self.client.get(f"/api/start_fill_form/{form_name}")
        assert response.status_code == 200
        data = response.json()
        self.fill_test_form(data['body'])

    def test_insert_form_mapping(self):
        print("Running test_insert_form_mapping...")
        form_id = "survey_formquestionnaire"
        mapping_data = [{"display_text": "ages", "type": "input_text", "form_field": "Text-aMBPtq-6L5"},
                        {"display_text": "gender", "type": "input_text", "form_field": "Text-aMBPtq-6L6"},
                        {"display_text": "location", "type": "input_text", "form_field": "Text-aMBPtq-6L7"}]
        response = self.client.post("/api/create_form_mapping", json={"form_id": form_id, "mapping_data": mapping_data})
        assert response.status_code == 200
        assert response.json() == {"success": True, "message": "Form mapping created successfully."}

    def test_invalid_route(self):
        print("Running test_invalid_route...")
        response = self.client.get("/api/invalid_route")
        assert response.status_code == 404

if __name__ == "__main__":
    test_cases = TestChatBotAPI()
    test_cases.setup_method()
    test_cases.test_index()
    test_cases.test_start_fill_form()
    test_cases.test_insert_form_mapping()
    test_cases.test_invalid_route()
