import { getAttendanceUrl, getBaseUrl, getApiHeaders } from '@/contexts/utils/auth.api';

export interface StudentAttendanceRecord {
  attendanceId: string;
  studentId: string;
  studentName: string;
  instituteName: string;
  className: string;
  subjectName: string;
  address: string;
  markedBy: string;
  markedAt: string;
  markingMethod: string;
  status: 'present' | 'absent' | 'late';
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
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    attendanceRate: number;
  };
}

export interface StudentAttendanceParams {
  studentId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const studentAttendanceApi = {
  getStudentAttendance: async (params: StudentAttendanceParams): Promise<StudentAttendanceResponse> => {
    // Use attendance-specific URL first, fallback to main API URL
    let baseUrl = getAttendanceUrl();
    if (!baseUrl) {
      baseUrl = getBaseUrl();
    }
    
    if (!baseUrl) {
      throw new Error('No API base URL configured. Please configure attendance URL in settings.');
    }

    // Remove trailing slash if present
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${baseUrl}/api/attendance/student/${params.studentId}?${queryParams.toString()}`;
    
    console.log('=== STUDENT ATTENDANCE API CALL ===');
    console.log('Attendance URL from config:', getAttendanceUrl());
    console.log('Base URL from config:', getBaseUrl());
    console.log('Using base URL:', baseUrl);
    console.log('Full API Endpoint:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP Error: ${response.status}`,
        success: false
      }));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Student attendance API response:', result);
    return result;
  }
};