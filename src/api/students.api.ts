
import { apiClient } from './client';

export interface StudentCreateData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    userType: string;
    dateOfBirth: string;
    gender: string;
    birthCertificateNo?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    imageUrl?: string;
    isActive?: boolean;
    fatherId?: string | null;
    motherId?: string | null;
    guardianId?: string | null;
  };
  studentId: string;
  emergencyContact: string;
  medicalConditions?: string;
  allergies?: string;
  bloodGroup?: string;
  isActive?: boolean;
}

export interface Student {
  userId: string;
  fatherId: string | null;
  motherId: string | null;
  guardianId: string | null;
  studentId: string;
  emergencyContact: string;
  medicalConditions?: string;
  allergies?: string;
  bloodGroup?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    dateOfBirth: string;
    gender: string;
    imageUrl?: string;
    isActive: boolean;
    subscriptionPlan: string;
    createdAt: string;
  };
}

export interface AssignParentData {
  parentUserId: string;
  parentType: 'father' | 'mother' | 'guardian';
}

export interface AssignParentResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export const studentsApi = {
  create: async (data: StudentCreateData): Promise<Student> => {
    const response = await apiClient.post('/students', data);
    return response.data;
  },
  
  assignParent: async (studentId: string, data: AssignParentData): Promise<AssignParentResponse> => {
    const response = await apiClient.patch(`/students/${studentId}/assign-parent`, data);
    return response.data;
  }
};
