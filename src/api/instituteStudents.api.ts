import { getAttendanceUrl, getApiHeaders } from '@/contexts/utils/auth.api';

export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  instituteId: string;
  instituteName: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  location: string;
  markingMethod: string;
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
  summary?: {
    totalPresent: number;
    totalAbsent: number;
    attendanceRate: number;
  };
}

export interface StudentAttendanceParams {
  page?: number;
  limit?: number;
  userId?: string;
  role?: string;
}

class InstituteStudentsApi {
  // 1. Institute-level attendance (InstituteAdmin only)
  async getInstituteStudentAttendance(
    instituteId: string, 
    params: StudentAttendanceParams = {},
    forceRefresh = false
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 50
    };

    console.log('Fetching institute student attendance for institute:', instituteId, 'with params:', queryParams);

    const attendanceUrl = getAttendanceUrl();
    const endpoint = `${attendanceUrl}/api/attendance/institute/${instituteId}?page=${queryParams.page}&limit=${queryParams.limit}`;
    const headers = await getApiHeaders();
    
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // 2. Class-level attendance (InstituteAdmin, Teacher)
  async getClassStudentAttendance(
    instituteId: string,
    classId: string,
    params: StudentAttendanceParams = {},
    forceRefresh = false
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 50
    };

    console.log('Fetching class student attendance for institute:', instituteId, 'class:', classId, 'with params:', queryParams);

    const attendanceUrl = getAttendanceUrl();
    const endpoint = `${attendanceUrl}/api/students/by-institute/${instituteId}/class/${classId}?page=${queryParams.page}&limit=${queryParams.limit}`;
    const headers = await getApiHeaders();
    
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // 3. Subject-level attendance (InstituteAdmin, Teacher)
  async getSubjectStudentAttendance(
    instituteId: string,
    classId: string,
    subjectId: string,
    params: StudentAttendanceParams = {},
    forceRefresh = false
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 50
    };

    console.log('Fetching subject student attendance for institute:', instituteId, 'class:', classId, 'subject:', subjectId, 'with params:', queryParams);

    const attendanceUrl = getAttendanceUrl();
    const endpoint = `${attendanceUrl}/api/students/by-institute/${instituteId}/class/${classId}/subject/${subjectId}?page=${queryParams.page}&limit=${queryParams.limit}`;
    const headers = await getApiHeaders();
    
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export const instituteStudentsApi = new InstituteStudentsApi();