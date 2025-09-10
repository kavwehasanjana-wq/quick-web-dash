import { attendanceApiClient } from './attendanceClient';
import { getAttendanceUrl, getApiHeaders, getBaseUrl } from '@/contexts/utils/auth.api';

export interface ChildAttendanceRecord {
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

export interface ChildAttendanceResponse {
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
  data: ChildAttendanceRecord[];
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    attendanceRate: number;
  };
}

export interface ChildAttendanceParams {
  studentId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface MarkAttendanceByCardRequest {
  studentCardId: string;
  instituteId: string;
  instituteName: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  address: string;
  markingMethod: 'qr' | 'barcode' | 'rfid/nfc';
  status: 'present' | 'absent' | 'late';
}

export interface MarkAttendanceByCardResponse {
  success: boolean;
  message: string;
  attendanceId: string;
  studentId: string;
  studentCardId: string;
  studentName: string;
}

export interface MarkAttendanceRequest {
  studentId: string;
  instituteId: string;
  instituteName: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  address: string;
  markingMethod: 'manual';
  status: 'present' | 'absent' | 'late';
}

export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  attendanceId: string;
}

class ChildAttendanceApi {
  async getChildAttendance(params: ChildAttendanceParams): Promise<ChildAttendanceResponse> {
    const { studentId, ...queryParams } = params;
    
    const defaultParams = {
      startDate: '2025-09-01',
      endDate: '2025-09-07',
      page: 1,
      limit: 5,
      ...queryParams
    };

    console.log('Fetching child attendance for student:', studentId, 'with params:', defaultParams);

    return attendanceApiClient.get<ChildAttendanceResponse>(
      `/api/attendance/student/${studentId}`,
      defaultParams,
      {
        forceRefresh: false,
        ttl: 60, // Cache for 1 minute
        useStaleWhileRevalidate: true
      }
    );
  }

  async markAttendanceByCard(request: MarkAttendanceByCardRequest): Promise<MarkAttendanceByCardResponse> {
    let attendanceBaseUrl = getAttendanceUrl();
    if (!attendanceBaseUrl) {
      // Use main API URL as fallback
      attendanceBaseUrl = getBaseUrl();
      if (!attendanceBaseUrl) {
        throw new Error('No API URL configured. Please set the API URL in settings.');
      }
    }

    // Ensure we use the same base URL that's working for other API calls
    const baseUrl = attendanceBaseUrl.endsWith('/') ? attendanceBaseUrl.slice(0, -1) : attendanceBaseUrl;
    const fullApiUrl = `${baseUrl}/api/attendance/mark-by-card`;
    
    console.log('=== ATTENDANCE BY CARD API CALL ===');
    console.log('Attendance URL from config:', getAttendanceUrl());
    console.log('Base URL from config:', getBaseUrl());
    console.log('Using base URL:', baseUrl);
    console.log('Full API Endpoint:', fullApiUrl);
    console.log('Request Method: POST');
    console.log('Request Body:', JSON.stringify(request, null, 2));
    console.log('Request Headers:', getApiHeaders());
    console.log('===============================');

    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('=== ATTENDANCE BY CARD API ERROR ===');
      console.error('Status Code:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Error Response:', errorText);
      console.error('Full API URL used:', fullApiUrl);
      console.error('Original Request:', JSON.stringify(request, null, 2));
      console.error('================================');
      throw new Error(`Failed to mark attendance by card: ${response.status} - ${errorText}`);
    }

    const result: MarkAttendanceByCardResponse = await response.json();
    console.log('=== ATTENDANCE BY CARD SUCCESS ===');
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    console.log('Original Request:', JSON.stringify(request, null, 2));
    console.log('===============================');
    return result;
  }

  async markAttendance(request: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    let attendanceBaseUrl = getAttendanceUrl();
    if (!attendanceBaseUrl) {
      // Use main API URL as fallback
      attendanceBaseUrl = getBaseUrl();
      if (!attendanceBaseUrl) {
        throw new Error('No API URL configured. Please set the API URL in settings.');
      }
    }

    const baseUrl = attendanceBaseUrl.endsWith('/') ? attendanceBaseUrl.slice(0, -1) : attendanceBaseUrl;
    const fullApiUrl = `${baseUrl}/api/attendance/mark`;

    console.log('=== MANUAL ATTENDANCE API CALL ===');
    console.log('Attendance URL from config:', getAttendanceUrl());
    console.log('Base URL from config:', getBaseUrl());
    console.log('Using base URL:', baseUrl);
    console.log('Full API Endpoint:', fullApiUrl);
    console.log('Request Method: POST');
    console.log('Request Body:', JSON.stringify(request, null, 2));
    console.log('Request Headers:', getApiHeaders());
    console.log('Request Details:');
    console.log('- Student ID:', request.studentId);
    console.log('- Institute ID:', request.instituteId);
    console.log('- Institute Name:', request.instituteName);
    console.log('- Class ID:', request.classId);
    console.log('- Class Name:', request.className);
    console.log('- Subject ID:', request.subjectId);
    console.log('- Subject Name:', request.subjectName);
    console.log('- Address:', request.address);
    console.log('- Marking Method:', request.markingMethod);
    console.log('- Status:', request.status);
    console.log('===============================');

    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('=== MANUAL ATTENDANCE API ERROR ===');
      console.error('Status Code:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Error Response:', errorText);
      console.error('Full API URL used:', fullApiUrl);
      console.error('Original Request:', JSON.stringify(request, null, 2));
      console.error('================================');
      throw new Error(`Failed to mark attendance: ${response.status} - ${errorText}`);
    }

    const result: MarkAttendanceResponse = await response.json();
    console.log('=== MANUAL ATTENDANCE SUCCESS ===');
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    console.log('Original Request:', JSON.stringify(request, null, 2));
    console.log('===============================');
    return result;
  }
}

export const childAttendanceApi = new ChildAttendanceApi();