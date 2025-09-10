import { cachedApiClient } from './cachedClient';
import { ApiResponse } from './client';

export interface Exam {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  examType: 'online' | 'physical';
  duration: number;
  maxMarks: number;
  passingMarks: number;
  examDate: string;
  startTime: string;
  endTime: string;
  venue?: string;
  examLink?: string;
  instructions?: string;
  status: 'scheduled' | 'draft' | 'completed' | 'cancelled';
  createdBy: string;
  toWhom: string;
  isActive: boolean;
}

export interface ExamCreateData {
  instituteId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  examType: 'online' | 'physical';
  duration: number;
  maxMarks: number;
  passingMarks: number;
  examDate: string;
  startTime: string;
  endTime: string;
  venue?: string | null;
  examLink?: string | null;
  instructions?: string | null;
  status: 'scheduled' | 'draft' | 'completed' | 'cancelled';
  createdBy: string;
  toWhom: string;
  isActive: boolean;
}

export interface ExamQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  isActive?: boolean;
}

class ExamApi {
  async getExams(params?: ExamQueryParams, forceRefresh = false): Promise<ApiResponse<Exam[]>> {
    console.log('Fetching exams with enhanced caching:', params, { forceRefresh });
    return cachedApiClient.get<ApiResponse<Exam[]>>('/institute-class-subject-exams', params, {
      forceRefresh,
      ttl: 30, // Cache exams for 30 minutes
      useStaleWhileRevalidate: true
    });
  }

  async getExamById(id: string, forceRefresh = false): Promise<Exam> {
    console.log('Fetching exam by ID with caching:', id, { forceRefresh });
    return cachedApiClient.get<Exam>(`/institute-class-subject-exams/${id}`, undefined, {
      forceRefresh,
      ttl: 30
    });
  }

  async createExam(data: ExamCreateData): Promise<Exam> {
    console.log('Creating exam:', data);
    return cachedApiClient.post<Exam>('/institute-class-subject-exams', data);
  }

  async updateExam(id: string, data: Partial<ExamCreateData>): Promise<Exam> {
    console.log('Updating exam:', id, data);
    return cachedApiClient.patch<Exam>(`/institute-class-subject-exams/${id}`, data);
  }

  async deleteExam(id: string): Promise<void> {
    console.log('Deleting exam:', id);
    return cachedApiClient.delete<void>(`/institute-class-subject-exams/${id}`);
  }

  // Method to check if exams are cached
  async hasExamsCached(params?: ExamQueryParams): Promise<boolean> {
    return cachedApiClient.hasCache('/institute-class-subject-exams', params);
  }

  // Method to get cached exams only
  async getCachedExams(params?: ExamQueryParams): Promise<ApiResponse<Exam[]> | null> {
    return cachedApiClient.getCachedOnly<ApiResponse<Exam[]>>('/institute-class-subject-exams', params);
  }

  // Method to preload exam data
  async preloadExams(params?: ExamQueryParams): Promise<void> {
    await cachedApiClient.preload<ApiResponse<Exam[]>>('/institute-class-subject-exams', params, 30);
  }
}

export const examApi = new ExamApi();
