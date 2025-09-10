import { cachedApiClient } from './cachedClient';
import { ApiResponse } from './client';

export interface Homework {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  maxMarks?: number;
  attachmentUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  class?: {
    id: string;
    name: string;
    code: string;
  };
  institute?: {
    id: string;
    name: string;
    code: string;
  };
  referenceLink?: string;
}

export interface HomeworkCreateData {
  instituteId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  instructions?: string;
  startDate?: string | null;
  dueDate?: string | null;
  maxMarks?: number | null;
  attachmentUrl?: string | null;
  isActive: boolean;
}

export interface HomeworkUpdateData extends Partial<HomeworkCreateData> {
  id: string;
}

export interface HomeworkQueryParams {
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

class HomeworkApi {
  async getHomework(params?: HomeworkQueryParams, forceRefresh = false): Promise<ApiResponse<Homework[]>> {
    console.log('Fetching homework with enhanced caching:', params, { forceRefresh });
    return cachedApiClient.get<ApiResponse<Homework[]>>('/institute-class-subject-homeworks', params, {
      forceRefresh,
      ttl: 15, // Cache homework for 15 minutes
      useStaleWhileRevalidate: true
    });
  }

  async getHomeworkById(id: string, forceRefresh = false): Promise<Homework> {
    console.log('Fetching homework by ID with caching:', id, { forceRefresh });
    return cachedApiClient.get<Homework>(`/institute-class-subject-homeworks/${id}`, undefined, {
      forceRefresh,
      ttl: 15
    });
  }

  async createHomework(data: HomeworkCreateData): Promise<Homework> {
    console.log('Creating homework:', data);
    return cachedApiClient.post<Homework>('/institute-class-subject-homeworks', data);
  }

  async updateHomework(id: string, data: Partial<HomeworkCreateData>): Promise<Homework> {
    console.log('Updating homework:', id, data);
    return cachedApiClient.patch<Homework>(`/institute-class-subject-homeworks/${id}`, data);
  }

  async deleteHomework(id: string): Promise<void> {
    console.log('Deleting homework:', id);
    return cachedApiClient.delete<void>(`/homework/${id}`);
  }

  // Method to check if homework is cached
  async hasHomeworkCached(params?: HomeworkQueryParams): Promise<boolean> {
    return cachedApiClient.hasCache('/institute-class-subject-homeworks', params);
  }

  // Method to get cached homework only
  async getCachedHomework(params?: HomeworkQueryParams): Promise<ApiResponse<Homework[]> | null> {
    return cachedApiClient.getCachedOnly<ApiResponse<Homework[]>>('/institute-class-subject-homeworks', params);
  }

  // Method to preload homework data
  async preloadHomework(params?: HomeworkQueryParams): Promise<void> {
    await cachedApiClient.preload<ApiResponse<Homework[]>>('/institute-class-subject-homeworks', params, 15);
  }

  // Legacy method for backward compatibility
  async getLegacyHomework(params?: HomeworkQueryParams): Promise<ApiResponse<Homework[]>> {
    console.log('Fetching legacy homework with params:', params);
    return cachedApiClient.get<ApiResponse<Homework[]>>('/homework', params, {
      ttl: 15,
      useStaleWhileRevalidate: true
    });
  }
}

export const homeworkApi = new HomeworkApi();
