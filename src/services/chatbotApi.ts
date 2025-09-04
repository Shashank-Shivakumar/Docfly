import axios, { AxiosResponse } from 'axios';

// API Base URL
const API_BASE_URL = 'https://chatbot-framework-api.z21crm.com/api' ;
//'http://localhost:8000/api';

// TypeScript Interfaces for API Responses
export interface WelcomeResponse {
  message: string;
}

export interface FormField {
  display_text: string;
  type: string;
  form_feild: any;
  _id: string;
  question?: string;
  next_question?: string;
  previous_question?: string;
  answer?: string;
}

export interface Progress {
  current: number;
  total: number;
}

export interface StartFormResponse {
  type: 'question' | 'complete_message';
  body: FormField;
  session_id?: string;
  progress?: Progress;
  success?: boolean;
}

export interface ChatResponse {
  current_id: string;
  answer: string;
}

export interface ChatResponseData {
  type: 'question' | 'complete_message';
  body?: FormField;
  message?: string;
  progress?: Progress;
  answers_summary?: Record<string, string>;
  success?: boolean;
  s3_presigned_url?: string;
}

export interface FormMapping {
  form_id: string;
  mapping_data: FormField[];
}

export interface FormMappingResponse {
  success: boolean;
  message: string;
}

export interface AvailableFormsResponse {
  forms: string[];
  pdf_files?: string[];
  count: number;
}

// API Service Class
class ChatbotApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get welcome message from the API
   */
  async getWelcomeMessage(): Promise<WelcomeResponse> {
    try {
      const response: AxiosResponse<WelcomeResponse> = await axios.get(`${this.baseURL}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching welcome message:', error);
      throw new Error('Failed to fetch welcome message');
    }
  }

  /**
   * Start filling a form and get the first question
   */
  async startFillForm(formName: string): Promise<StartFormResponse> {
    try {
      const response: AxiosResponse<StartFormResponse> = await axios.get(
        `${this.baseURL}/start_fill_form/${formName}`
      );
      return response.data;
    } catch (error) {
      console.error('Error starting form:', error);
      throw new Error(`Failed to start form: ${formName}`);
    }
  }

  /**
   * Send chat response and get next question or completion message
   */
  async sendChatResponse(currentId: string, answer: string): Promise<ChatResponseData> {
    try {
      const requestData: ChatResponse = {
        current_id: currentId,
        answer: answer
      };

      const response: AxiosResponse<ChatResponseData> = await axios.post(
        `${this.baseURL}/chat_response`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending chat response:', error);
      throw new Error('Failed to send chat response');
    }
  }

  /**
   * Download file from S3 presigned URL
   */
  async downloadFromS3(presignedUrl: string, filename?: string): Promise<void> {
    try {
      const response = await axios.get(presignedUrl, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  /**
   * Create form mapping
   */
  async createFormMapping(formId: string, mappingData: FormField[]): Promise<FormMappingResponse> {
    try {
      const requestData: FormMapping = {
        form_id: formId,
        mapping_data: mappingData
      };

      const response: AxiosResponse<FormMappingResponse> = await axios.post(
        `${this.baseURL}/create_form_mapping`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating form mapping:', error);
      throw new Error('Failed to create form mapping');
    }
  }

  /**
   * Upload file to server
   */
  async uploadFile(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${this.baseURL}/upload_file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Get available forms
   */
  async getAvailableForms(): Promise<AvailableFormsResponse> {
    try {
      const response: AxiosResponse<AvailableFormsResponse> = await axios.get(`${this.baseURL}/list_fillable_pdf_s3`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available forms:', error);
      throw new Error('Failed to fetch available forms');
    }
  }
}

// Export singleton instance
export const chatbotApi = new ChatbotApiService();

// Export individual functions for convenience
export const getWelcomeMessage = () => chatbotApi.getWelcomeMessage();
export const startFillForm = (formName: string) => chatbotApi.startFillForm(formName);
export const sendChatResponse = (currentId: string, answer: string) => chatbotApi.sendChatResponse(currentId, answer);
export const downloadFromS3 = (presignedUrl: string, filename?: string) => chatbotApi.downloadFromS3(presignedUrl, filename);
export const createFormMapping = (formId: string, mappingData: FormField[]) => chatbotApi.createFormMapping(formId, mappingData);
export const getAvailableForms = () => chatbotApi.getAvailableForms();
export const uploadFile = (file: File) => chatbotApi.uploadFile(file);