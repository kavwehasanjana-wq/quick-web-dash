
import { apiClient } from './client';

export interface InstituteClassCreateData {
  instituteId: string;
  name: string;
  code: string;
  academicYear: string;
  level: number;
  grade: number;
  specialty: string;
  classType: string;
  capacity: number;
  classTeacherId?: string;
  description?: string;
  isActive?: boolean;
  startDate: string;
  endDate: string;
  enrollmentCode?: string;
  enrollmentEnabled?: boolean;
  requireTeacherVerification?: boolean;
  imageUrl?: string;
}

export interface InstituteClass {
  id: string;
  instituteId: string;
  name: string;
  code: string;
  academicYear: string;
  level: number;
  grade: number;
  specialty: string;
  classType: string;
  capacity: number;
  classTeacherId?: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  enrollmentCode?: string;
  enrollmentEnabled: boolean;
  requireTeacherVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstituteClassResponse {
  class: InstituteClass;
  message: string;
}

export interface BulkAssignStudentsData {
  studentUserIds: string[];
  skipVerification?: boolean;
  assignmentNotes?: string;
}

export interface TeacherAssignResponse {
  success: string[];
  failed: string[];
}

export interface AssignmentResult {
  studentUserId: string;
  success: boolean;
  status: string;
  assignment?: {
    instituteId: string;
    classId: string;
    studentUserId: string;
    isActive: boolean;
    isVerified: boolean;
    enrollmentMethod: string;
    assignedAt: string;
  };
  error?: string;
}

export interface BulkAssignResponse {
  message: string;
  class: {
    id: string;
    name: string;
    code: string;
    instituteId: string;
  };
  summary: {
    totalRequested: number;
    newlyAssigned: number;
    alreadyEnrolled: number;
    failed: number;
    assignedBy: string;
    operationType: string;
  };
  newlyAssigned: AssignmentResult[];
  errors: AssignmentResult[];
}

export interface EnrollClassData {
  classId: string;
  enrollmentCode: string;
}

export interface EnrollmentResult {
  message: string;
  class: {
    id: string;
    name: string;
    code: string;
  };
  enrollment: {
    studentUserId: string;
    isVerified: boolean;
    enrollmentMethod: string;
    enrolledAt: string;
  };
  requiresVerification: boolean;
}

export const instituteClassesApi = {
  create: async (data: InstituteClassCreateData): Promise<InstituteClassResponse> => {
    const response = await apiClient.post('/institute-classes', data);
    return response.data;
  },

  getByInstitute: async (instituteId: string): Promise<InstituteClass[]> => {
    console.log('🚀 API call to getByInstitute with instituteId:', instituteId);
    const response = await apiClient.get(`/institute-classes/institute/${instituteId}`);
    console.log('📡 Full API response:', response);
    console.log('📦 Response data:', response.data);
    console.log('📊 Response data type:', typeof response.data);
    console.log('📋 Response data keys:', response.data ? Object.keys(response.data) : 'No data');
    // The response is already the array, not wrapped in a data property
    return response;
  },

  enroll: async (data: EnrollClassData): Promise<EnrollmentResult> => {
    const response = await apiClient.post('/institute-classes/enroll', data);
    return response.data;
  },

  assignStudentsBulk: async (classId: string, data: BulkAssignStudentsData): Promise<BulkAssignResponse> => {
    const response = await apiClient.post(`/institute-classes/${classId}/assign-students-bulk`, data);
    return response.data;
  },

  teacherAssignStudents: async (instituteId: string, classId: string, data: BulkAssignStudentsData): Promise<TeacherAssignResponse> => {
    const response = await apiClient.post(`/institutes/${instituteId}/classes/${classId}/students/teacher-assign`, data);
    return response.data;
  }
};
