import { cachedApiClient } from './cachedClient';
import { ApiResponse } from './client';

export interface ExamResult {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  studentId: string;
  examId: string;
  score: string;
  grade: string;
  remarks: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  exam: {
    id: string;
    title: string;
    examType: string;
  };
}

export interface ExamResultsQueryParams {
  page?: number;
  limit?: number;
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  examId?: string;
}

export interface ExamResultsResponse {
  data: ExamResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

class ExamResultsApi {
  async getExamResults(params?: ExamResultsQueryParams, forceRefresh = false): Promise<ExamResultsResponse> {
    console.log('Fetching exam results:', params, { forceRefresh });
    return cachedApiClient.get<ExamResultsResponse>('/institute-class-subject-resaults', params, {
      forceRefresh,
      ttl: 30, // Cache results for 30 minutes
      useStaleWhileRevalidate: true
    });
  }
}

export const examResultsApi = new ExamResultsApi();