import React, { useState } from 'react';
import { chatbotApi, FormField } from '../services/chatbotApi';

/**
 * Test component to demonstrate the TypeScript API functions
 * This component shows how to use the chatbot API service
 */
export const ChatbotTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testWelcomeMessage = async () => {
    setIsLoading(true);
    try {
      const result = await chatbotApi.getWelcomeMessage();
      addResult(`✅ Welcome Message: ${result.message}`);
    } catch (error) {
      addResult(`❌ Welcome Message Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAvailableForms = async () => {
    setIsLoading(true);
    try {
      const result = await chatbotApi.getAvailableForms();
      addResult(`✅ Available Forms: ${result.forms.join(', ')} (${result.count} total)`);
    } catch (error) {
      addResult(`❌ Available Forms Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testStartForm = async () => {
    setIsLoading(true);
    try {
      const result = await chatbotApi.startFillForm('sample_form');
      addResult(`✅ Started Form: ${result.body.display_text} (Type: ${result.body.type})`);
      addResult(`📊 Progress: ${result.progress.current}/${result.progress.total}`);
    } catch (error) {
      addResult(`❌ Start Form Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateMapping = async () => {
    setIsLoading(true);
    try {
      const mappingData: FormField[] = [
        {
          display_text: "Test Question 1",
          type: "input_text",
          form_feild: "test_field_1",
          answer: ""
        },
        {
          display_text: "Test Question 2",
          type: "input_text", 
          form_feild: "test_field_2",
          answer: ""
        }
      ];
      
      const result = await chatbotApi.createFormMapping('test_form', mappingData);
      addResult(`✅ Created Mapping: ${result.message}`);
    } catch (error) {
      addResult(`❌ Create Mapping Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chatbot API Test Suite</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={testWelcomeMessage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Welcome Message
        </button>
        
        <button
          onClick={testAvailableForms}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Available Forms
        </button>
        
        <button
          onClick={testStartForm}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Start Form
        </button>
        
        <button
          onClick={testCreateMapping}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Test Create Mapping
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Test Results:</h3>
        <button
          onClick={clearResults}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">No test results yet. Click a test button above.</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600">Testing API...</span>
          </div>
        </div>
      )}
    </div>
  );
};
