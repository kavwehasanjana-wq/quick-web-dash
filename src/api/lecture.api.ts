import { cachedApiClient } from './cachedClient';
import { ApiResponse } from './client';

export interface Lecture {
  id: string;
  instituteId: string;
  classId?: string;
  subjectId?: string;
  instructorId: string;
  title: string;
  description: string;
  lectureType: 'online' | 'physical';
  venue?: string;
  subject?: string;
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  isRecorded: boolean;
  maxParticipants: number;
  isActive: boolean;
}

export interface LectureCreateData {
  instituteId: string;
  classId?: string;
  subjectId?: string;
  instructorId: string;
  title: string;
  description: string;
  lectureType: 'online' | 'physical';
  venue?: string | null;
  subject?: string;
  startTime?: string | null;
  endTime?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  meetingLink?: string | null;
  meetingId?: string | null;
  meetingPassword?: string | null;
  recordingUrl?: string | null;
  isRecorded: boolean;
  maxParticipants: number;
  isActive: boolean;
}

export interface LectureQueryParams {
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

class LectureApi {
  async getLectures(params?: LectureQueryParams, forceRefresh = false): Promise<ApiResponse<Lecture[]>> {
    console.log('Fetching lectures with enhanced caching:', params, { forceRefresh });
    return cachedApiClient.get<ApiResponse<Lecture[]>>('/institute-class-subject-lectures', params, {
      forceRefresh,
      ttl: 10, // Cache lectures for 10 minutes (they change frequently)
      useStaleWhileRevalidate: true
    });
  }

  async getInstituteLectures(params?: LectureQueryParams, forceRefresh = false): Promise<ApiResponse<Lecture[]>> {
    console.log('Fetching institute lectures with enhanced caching:', params, { forceRefresh });
    return cachedApiClient.get<ApiResponse<Lecture[]>>('/institute-lectures', params, {
      forceRefresh,
      ttl: 10,
      useStaleWhileRevalidate: true
    });
  }

  async getLectureById(id: string, forceRefresh = false): Promise<Lecture> {
    console.log('Fetching lecture by ID with caching:', id, { forceRefresh });
    return cachedApiClient.get<Lecture>(`/institute-class-subject-lectures/${id}`, undefined, {
      forceRefresh,
      ttl: 10
    });
  }

  async createLecture(data: LectureCreateData, isInstituteLecture: boolean = false): Promise<Lecture> {
    const endpoint = isInstituteLecture ? '/institute-lectures' : '/institute-class-subject-lectures';
    console.log('Creating lecture:', endpoint, data);
    return cachedApiClient.post<Lecture>(endpoint, data);
  }

  async updateLecture(id: string, data: Partial<LectureCreateData>): Promise<Lecture> {
    console.log('Updating lecture:', id, data);
    return cachedApiClient.patch<Lecture>(`/institute-class-subject-lectures/${id}`, data);
  }

  async deleteLecture(id: string): Promise<void> {
    console.log('Deleting lecture:', id);
    return cachedApiClient.delete<void>(`/institute-class-subject-lectures/${id}`);
  }

  // Method to check if lectures are cached
  async hasLecturesCached(params?: LectureQueryParams): Promise<boolean> {
    return cachedApiClient.hasCache('/institute-class-subject-lectures', params);
  }

  // Method to get cached lectures only
  async getCachedLectures(params?: LectureQueryParams): Promise<ApiResponse<Lecture[]> | null> {
    return cachedApiClient.getCachedOnly<ApiResponse<Lecture[]>>('/institute-class-subject-lectures', params);
  }

  // Method to preload lecture data
  async preloadLectures(params?: LectureQueryParams): Promise<void> {
    await cachedApiClient.preload<ApiResponse<Lecture[]>>('/institute-class-subject-lectures', params, 10);
  }
}

export const lectureApi = new LectureApi();
