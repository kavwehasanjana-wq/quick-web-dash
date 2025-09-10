import { cachedApiClient } from './cachedClient';
import { apiClient } from './client';
import { ApiResponse } from './client';

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  submissionDate: string;
  fileUrl?: string;
  teacherCorrectionFileUrl?: string;
  remarks?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  homework?: {
    id: string;
    title: string;
    description: string;
  };
}

export interface HomeworkSubmissionCreateData {
  homeworkId: string;
  studentId: string;
  submissionDate: string;
  fileUrl?: string;
  teacherCorrectionFileUrl?: string;
  remarks?: string;
  isActive: boolean;
}

export interface HomeworkSubmissionQueryParams {
  page?: number;
  limit?: number;
  homeworkId?: string;
  studentId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class HomeworkSubmissionsApi {
  async submitHomework(homeworkId: string, file: File): Promise<{
    success: boolean;
    message: string;
    data: {
      submissionId: string;
      fileId: string;
      publicUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      submittedAt: string;
    };
  }> {
    console.log('Submitting homework:', { 
      homeworkId, 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await apiClient.post(`/institute-class-subject-homework-submissions/1/submit`, formData);
      console.log('Homework submission successful:', response);
      return response;
    } catch (error: any) {
      console.error('Homework submission failed:', {
        homeworkId,
        error: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    }
  }

  async createSubmission(data: HomeworkSubmissionCreateData): Promise<HomeworkSubmission> {
    console.log('Creating homework submission:', data);
    return cachedApiClient.post<HomeworkSubmission>('/institute-class-subject-homeworks-submissions', data);
  }

  async getSubmissions(params?: HomeworkSubmissionQueryParams, forceRefresh = false): Promise<ApiResponse<HomeworkSubmission[]>> {
    console.log('Fetching homework submissions:', params, { forceRefresh });
    return cachedApiClient.get<ApiResponse<HomeworkSubmission[]>>('/institute-class-subject-homeworks-submissions', params, {
      forceRefresh,
      ttl: 10, // Cache submissions for 10 minutes
      useStaleWhileRevalidate: true
    });
  }

  async getSubmissionById(id: string, forceRefresh = false): Promise<HomeworkSubmission> {
    console.log('Fetching homework submission by ID:', id, { forceRefresh });
    return cachedApiClient.get<HomeworkSubmission>(`/institute-class-subject-homeworks-submissions/${id}`, undefined, {
      forceRefresh,
      ttl: 10
    });
  }

  async updateSubmission(id: string, data: Partial<HomeworkSubmissionCreateData>): Promise<HomeworkSubmission> {
    console.log('Updating homework submission:', id, data);
    return cachedApiClient.patch<HomeworkSubmission>(`/institute-class-subject-homeworks-submissions/${id}`, data);
  }

  async deleteSubmission(id: string): Promise<void> {
    console.log('Deleting homework submission:', id);
    return cachedApiClient.delete<void>(`/institute-class-subject-homeworks-submissions/${id}`);
  }
}

export const homeworkSubmissionsApi = new HomeworkSubmissionsApi();