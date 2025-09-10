import { apiClient } from './client';

// Request/Response Types
export interface SelfEnrollRequest {
  enrollmentKey: string;
}

export interface SelfEnrollResponse {
  message: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  className: string;
  enrollmentMethod: string;
  enrolledAt: string;
}

export interface TeacherAssignRequest {
  studentIds: string[];
}

export interface TeacherAssignResponse {
  message: string;
  successCount: number;
  failedCount: number;
  successfulAssignments: Array<{
    studentId: string;
    studentName: string;
    status: string;
  }>;
  failedAssignments: Array<{
    studentId: string;
    studentName?: string;
    status: string;
    reason: string;
  }>;
}

export interface EnrollmentSettingsRequest {
  enrollmentEnabled: boolean;
}

export interface EnrollmentSettingsResponse {
  instituteId: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  className: string;
  enrollmentEnabled: boolean;
  enrollmentKey?: string;
  currentEnrollmentCount: number;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(public status: number, public response: any) {
    const errorMessages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "Authentication required. Please log in.",
      403: "You don't have permission for this action.",
      404: "Resource not found or enrollment disabled.",
      409: "Enrollment conflict (already enrolled).",
      500: "Server error. Please try again later."
    };
    
    super(errorMessages[status] || 'An unexpected error occurred');
  }
}

export const enrollmentApi = {
  // Student self-enrollment
  async selfEnroll(enrollmentKey: string): Promise<SelfEnrollResponse> {
    try {
      const response = await apiClient.post('/institute-class-subject-students/self-enroll', {
        enrollmentKey
      });
      return response;
    } catch (error: any) {
      throw new ApiError(error.status || 500, error.response || error);
    }
  },

  // Teacher assigns students
  async teacherAssignStudents(
    instituteId: string,
    classId: string,
    subjectId: string,
    studentIds: string[]
  ): Promise<TeacherAssignResponse> {
    try {
      const response = await apiClient.post(
        `/institute-class-subject-students/teacher-assign/${instituteId}/${classId}/${subjectId}`,
        { studentIds }
      );
      return response;
    } catch (error: any) {
      throw new ApiError(error.status || 500, error.response || error);
    }
  },

  // Update enrollment settings
  async updateEnrollmentSettings(
    instituteId: string,
    classId: string,
    subjectId: string,
    enrollmentEnabled: boolean
  ): Promise<EnrollmentSettingsResponse> {
    try {
      const response = await apiClient.patch(
        `/institute-class-subject-students/enrollment-settings/${instituteId}/${classId}/${subjectId}`,
        { enrollmentEnabled }
      );
      return response;
    } catch (error: any) {
      throw new ApiError(error.status || 500, error.response || error);
    }
  },

  // Get enrollment settings
  async getEnrollmentSettings(
    instituteId: string,
    classId: string,
    subjectId: string
  ): Promise<EnrollmentSettingsResponse> {
    try {
      const response = await apiClient.get(
        `/institute-class-subject-students/enrollment-settings/${instituteId}/${classId}/${subjectId}`
      );
      return response;
    } catch (error: any) {
      throw new ApiError(error.status || 500, error.response || error);
    }
  }
};