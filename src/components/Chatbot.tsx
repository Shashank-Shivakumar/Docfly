import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowLeft, FileText } from 'lucide-react';
import { 
  chatbotApi, 
  FormField, 
  StartFormResponse, 
  ChatResponseData,
  AvailableFormsResponse,
  downloadFromS3 
} from '../services/chatbotApi';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isQuestion?: boolean;
  options?: string[];
}

interface ChatbotProps {
  onBack: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<FormField | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadAvailableForms();
    addBotMessage("Welcome! I'll help you fill out forms by asking questions. Please select a form to get started or click 'Start Survey' to begin with a sample form.");
  }, []);

  const loadAvailableForms = async () => {
    try {
      const data: AvailableFormsResponse = await chatbotApi.getAvailableForms();
      // Use pdf_files if available, otherwise fall back to forms
      setAvailableForms(data.pdf_files || data.forms);
    } catch (error) {
      console.error('Error loading forms:', error);
      addBotMessage("Sorry, I couldn't load the available forms. Please try again later.");
    }
  };

  const addBotMessage = (content: string, isQuestion = false, options?: string[]) => {
    const message: Message = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      isQuestion,
      options
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const startForm = async (formName: string) => {
    setIsLoading(true);
    try {
      const data: StartFormResponse = await chatbotApi.startFillForm(formName);
      
      console.log('🚀 Start form response:', data);
      
      // Handle different response types - check for both 'question' type and 'success' flag
      if (data.type === 'question' || (data as any).success === true) {
        const questionData = data.body;
        setCurrentQuestion(questionData);
        setProgress(data.progress || { current: 1, total: 1 });
        setSelectedForm(formName);
        
        const questionText = questionData.question || questionData.display_text;
        const options = questionData.type === 'check_list' && questionData.form_feild 
          ? Object.keys(questionData.form_feild) 
          : undefined;
        
        console.log('❓ First question:', questionText, 'Options:', options);
        addBotMessage(questionText, true, options);
      } else {
        console.error('❌ Unexpected response type:', data.type);
        addBotMessage("Sorry, I couldn't start the form. Please try again.");
      }
    } catch (error) {
      console.error('Error starting form:', error);
      addBotMessage("Sorry, I couldn't start the form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    console.log('🔍 Submitting answer:', {
      question: currentQuestion.display_text,
      form_feild: currentQuestion.form_feild,
      answer: answer,
      type: currentQuestion.type
    });

    addUserMessage(answer);
    setIsLoading(true);

    try {
      let currentId: string;
      
      // Use the _id field from the current question as current_id
      currentId = currentQuestion._id || currentQuestion.form_feild as string;
      console.log('🔧 Using current_id:', { 
        currentId, 
        questionType: currentQuestion.type,
        answer 
      });

      const data: ChatResponseData = await chatbotApi.sendChatResponse(currentId, answer);
      
      console.log('📥 Received response:', data);

      // Check for download URL in response
      // if (data.s3_presigned_url) {
      //   setDownloadUrl(data.s3_presigned_url);
      // }

      if (data.type === 'complete_message') {
        setIsCompleted(true);
        setDownloadUrl(data.s3_presigned_url ?? null);
        addBotMessage(data.message || "Form completed!");
        addBotMessage("🎉 Form completed successfully! All your answers have been saved.");
        
        // If there's a download URL, show download message
        if (data.s3_presigned_url) {
          addBotMessage("📄 Your filled form is ready for download!");
        }
        
        setCurrentQuestion(null);
      } else if (data.body || data.type === 'question') {
        const questionData = data.body;
        if (questionData) {
          setCurrentQuestion(questionData);
          setProgress(data.progress || { current: 0, total: 0 });
          
          const questionText = questionData.question || questionData.display_text;
          const options = questionData.type === 'check_list' && questionData.form_feild 
            ? Object.keys(questionData.form_feild) 
            : undefined;
          
          console.log('➡️ Next question:', questionText, 'Options:', options);
          addBotMessage(questionText, true, options);
        }
      } else {
        console.error('❌ Unexpected response type:', data.type);
        addBotMessage("Sorry, there was an unexpected response from the server.");
      }
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      addBotMessage("Sorry, there was an error processing your answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isLoading) {
      submitAnswer(currentInput.trim());
      setCurrentInput('');
    }
  };

  // Add download handler function
  const handleDownload = async () => {
    if (downloadUrl) {
      try {
        await downloadFromS3(downloadUrl, `${selectedForm || 'form'}-filled.pdf`);
      } catch (error) {
        console.error('Error downloading file:', error);
        addBotMessage("Sorry, there was an error downloading the file. Please try again.");
      }
    }
  };

  const handleOptionClick = (option: string) => {
    if (!isLoading) {
      submitAnswer(option);
    }
  };

  const handleFormSelect = (formName: string) => {
    addUserMessage(formName);
    startForm(formName);
  };

  const handleStartSurvey = async () => {
    // const sampleFormName = "sample_form";
    const sampleFormName = "Profile"; // Default sample form
    addUserMessage(`Starting survey: ${sampleFormName}`);
    await startForm(sampleFormName);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentQuestion(null);
    setProgress({ current: 0, total: 0 });
    setIsCompleted(false);
    setSelectedForm(null);
    setDownloadUrl(null); // Clear download URL
    addBotMessage("Welcome back! Please select a form to get started.");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Docfly
          </button>
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Form Assistant</h1>
          </div>
        </div>
        
        {/* Start Survey Button */}
        {!selectedForm && !isCompleted && (
          <button
            onClick={handleStartSurvey}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Start Survey
          </button>
        )}
        
        {progress.total > 0 && (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Progress: {progress.current}/{progress.total}
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md xl:max-w-lg ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Form Selection Options */}
                  {message.type === 'bot' && !selectedForm && availableForms.length > 0 && 
                   message.content.includes('select a form') && (
                    <div className="mt-3 space-y-2">
                      {availableForms.map((form) => (
                        <button
                          key={form}
                          onClick={() => handleFormSelect(form)}
                          className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm transition-colors"
                        >
                          <FileText className="w-4 h-4 inline mr-2" />
                          {form.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Question Options */}
                  {message.isQuestion && message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleOptionClick(option)}
                          disabled={isLoading}
                          className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm transition-colors disabled:opacity-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {currentQuestion && !isCompleted && currentQuestion.type === 'input_text' && (
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex space-x-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!currentInput.trim() || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      )}

            {/* Completion Actions */}
      {isCompleted && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex justify-center space-x-4">
            {/* Download Button - only show if download URL is available */}
            {downloadUrl && (
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Download Filled Form</span>
              </button>
            )}
            <button
              onClick={resetChat}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Fill Another Form</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Docfly</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
