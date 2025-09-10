import { getBaseUrl, getAttendanceUrl, getApiHeaders } from '@/contexts/utils/auth.api';

export interface StudentAttendanceRecord {
  studentId: string;
  studentCardId: string;
  studentName: string;
  instituteName: string;
  className?: string;
  subjectName?: string;
  lastAttendanceDate: string;
  attendanceCount: number;
  studentDetails: {
    email: string;
    phoneNumber: string;
    city: string;
    district: string;
    province: string;
    isActive: boolean;
    dateOfBirth: string;
    gender: string;
  };
}

export interface StudentAttendanceResponse {
  success: boolean;
  message: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: StudentAttendanceRecord[];
}

export interface StudentAttendanceParams {
  page?: number;
  limit?: number;
}

class InstituteStudentsApi {
  private getApiBaseUrl(): string {
    // First try attendance-specific URL
    const attendanceUrl = getAttendanceUrl();
    if (attendanceUrl) {
      return attendanceUrl.endsWith('/') ? attendanceUrl.slice(0, -1) : attendanceUrl;
    }
    
    // Fall back to main API URL - if no attendance URL is configured, use the main API URL
    const baseUrl = getBaseUrl();
    if (baseUrl) {
      return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    }
    
    // If no API URLs are configured, throw a more specific error
    throw new Error('No API base URL configured. Please configure your API settings in Settings page first.');
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const baseUrl = this.getApiBaseUrl();
    
    if (!baseUrl) {
      throw new Error('No API base URL configured. Please configure your API settings.');
    }

    const url = new URL(`${baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    console.log('Institute Students API Request:', url.toString());
    
    const headers = getApiHeaders();
    console.log('Request Headers:', headers);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    console.log('API Response Status:', response.status);
    console.log('Response Content-Type:', response.headers.get('Content-Type'));

    // Check if response is HTML (ngrok warning page)
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      const htmlContent = await response.text();
      
      // Check if it's an ngrok warning page
      if (htmlContent.includes('ngrok') && htmlContent.includes('You are about to visit')) {
        throw new Error('Ngrok tunnel is showing a browser warning. Please visit the URL in a browser first to accept the warning, or use a different ngrok tunnel configuration.');
      }
      
      throw new Error('API returned HTML instead of JSON. This might be a server configuration issue.');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, get the text response
        const errorText = await response.text();
        errorData = {
          message: errorText || `HTTP Error: ${response.status}`,
          statusCode: response.status,
          error: response.statusText
        };
      }
      
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `Cannot GET ${endpoint}`);
    }

    try {
      return await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, provide a more helpful error
      const responseText = await response.text();
      console.error('Failed to parse JSON response:', responseText);
      throw new Error('Invalid JSON response from server. The server might be returning HTML or plain text instead of JSON.');
    }
  }

  // 1. Institute-level attendance (InstituteAdmin only)
  async getInstituteStudentAttendance(
    instituteId: string, 
    params: StudentAttendanceParams = {}
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    console.log('Fetching institute student attendance for institute:', instituteId, 'with params:', queryParams);

    return this.makeRequest<StudentAttendanceResponse>(
      `/api/students/by-institute/${instituteId}/`,
      queryParams
    );
  }

  // 2. Class-level attendance (InstituteAdmin, Teacher)
  async getClassStudentAttendance(
    instituteId: string,
    classId: string,
    params: StudentAttendanceParams = {}
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    console.log('Fetching class student attendance for institute:', instituteId, 'class:', classId, 'with params:', queryParams);

    return this.makeRequest<StudentAttendanceResponse>(
      `/api/students/by-institute/${instituteId}/class/${classId}`,
      queryParams
    );
  }

  // 3. Subject-level attendance (InstituteAdmin, Teacher)
  async getSubjectStudentAttendance(
    instituteId: string,
    classId: string,
    subjectId: string,
    params: StudentAttendanceParams = {}
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    console.log('Fetching subject student attendance for institute:', instituteId, 'class:', classId, 'subject:', subjectId, 'with params:', queryParams);

    return this.makeRequest<StudentAttendanceResponse>(
      `/api/students/by-institute/${instituteId}/class/${classId}/subject/${subjectId}`,
      queryParams
    );
  }
}

export const instituteStudentsApi = new InstituteStudentsApi();