
import { cachedApiClient } from './cachedClient';
import { ApiResponse } from './client';

export interface Institute {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Class {
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
  enrollmentCode: string;
  enrollmentEnabled: boolean;
  requireTeacherVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
}

export interface InstituteUser {
  instituteId: string;
  userId: string;
  userIdByInstitute: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  institute: Institute;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    dateOfBirth: string | null;
    gender: string;
    imageUrl: string | null;
    isActive: boolean;
    subscriptionPlan: string;
    paymentExpiresAt: string | null;
    createdAt: string;
    nic: string;
    birthCertificateNo: string;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string;
    district: string;
    province: string;
    postalCode: string;
    country: string;
    updatedAt: string;
    password: string;
    idUrl: string | null;
  };
}

export interface InstituteQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

class InstituteApi {
  async getUserInstitutes(userId: string, forceRefresh = false): Promise<Institute[]> {
    console.log('Fetching user institutes for user:', userId, { forceRefresh });
    const endpoint = `/users/${userId}/institutes`;
    
    return cachedApiClient.get<Institute[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 120, // Cache for 2 hours since institutes don't change often
      useStaleWhileRevalidate: true
    });
  }

  async getInstituteClasses(
    instituteId: string, 
    params?: InstituteQueryParams, 
    forceRefresh = false
  ): Promise<ApiResponse<Class[]>> {
    console.log('Fetching institute classes:', instituteId, params, { forceRefresh });
    const endpoint = '/institute-classes';
    const requestParams = { instituteId, ...params };
    
    return cachedApiClient.get<ApiResponse<Class[]>>(endpoint, requestParams, { 
      forceRefresh,
      ttl: 60, // Cache for 1 hour
      useStaleWhileRevalidate: true
    });
  }

  async getInstituteClassSubjects(
    instituteId: string, 
    classId?: string, 
    forceRefresh = false
  ): Promise<any[]> {
    // Use the correct endpoint that works based on network requests
    const endpoint = `/institute-class-subjects/institute/${instituteId}`;
    
    console.log('Fetching institute class subjects:', endpoint, { forceRefresh });
    
    return cachedApiClient.get<any[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 60, // Cache for 1 hour
      useStaleWhileRevalidate: true
    });
  }

  async getInstituteUsers(instituteId: string, forceRefresh = false): Promise<InstituteUser[]> {
    console.log('Fetching institute users for institute:', instituteId, { forceRefresh });
    const endpoint = `/institute-users/institute/${instituteId}/users`;
    
    return cachedApiClient.get<InstituteUser[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 30, // Cache for 30 minutes since user data changes more frequently
      useStaleWhileRevalidate: true
    });
  }

  async getInstituteUsersByType(instituteId: string, userType: 'STUDENT' | 'TEACHER' | 'ATTENDANCE_MARKER', forceRefresh = false): Promise<{
    data: Array<{
      id: string;
      name: string;
      email?: string;
      addressLine1?: string;
      addressLine2?: string;
      phoneNumber?: string;
      imageUrl?: string;
      dateOfBirth?: string;
      userIdByInstitute?: string | null;
      verifiedBy?: string | null;
      fatherId?: string;
      motherId?: string;
      guardianId?: string;
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    console.log('Fetching institute users by type:', { instituteId, userType, forceRefresh });
    const endpoint = `/institute-users/institute/${instituteId}/users/${userType}`;
    
    return cachedApiClient.get(endpoint, undefined, { 
      forceRefresh,
      ttl: 30, // Cache for 30 minutes since user data changes more frequently
      useStaleWhileRevalidate: true
    });
  }

  async getClassSubjects(instituteId: string, classId: string, forceRefresh = false): Promise<ApiResponse<any[]>> {
    console.log('Fetching class subjects:', { instituteId, classId, forceRefresh });
    const endpoint = `/institutes/${instituteId}/classes/${classId}/subjects`;
    
    return cachedApiClient.get<ApiResponse<any[]>>(endpoint, undefined, { 
      forceRefresh,
      ttl: 60, // Cache for 1 hour
      useStaleWhileRevalidate: true
    });
  }

  // Enhanced method to check if data is already cached
  async hasInstituteDataCached(userId: string, instituteId?: string): Promise<{
    institutes: boolean;
    classes: boolean;
    subjects: boolean;
    users: boolean;
  }> {
    const results = {
      institutes: false,
      classes: false,
      subjects: false,
      users: false
    };

    try {
      // Check if institutes are cached
      results.institutes = await cachedApiClient.hasCache(`/users/${userId}/institutes`);

      if (instituteId) {
        // Check if classes are cached
        results.classes = await cachedApiClient.hasCache('/institute-classes', { instituteId });

        // Check if subjects are cached
        results.subjects = await cachedApiClient.hasCache(`/institute-class-subjects/institute/${instituteId}`);

        // Check if users are cached
        results.users = await cachedApiClient.hasCache(`/institute-users/institute/${instituteId}/users`);
      }
    } catch (error) {
      console.warn('Error checking cached data:', error);
    }

    return results;
  }

  // Method to get all cached data without API calls
  async getCachedInstituteData(userId: string, instituteId?: string): Promise<{
    institutes: Institute[] | null;
    classes: ApiResponse<Class[]> | null;
    subjects: any[] | null;
    users: InstituteUser[] | null;
  }> {
    const data = {
      institutes: null as Institute[] | null,
      classes: null as ApiResponse<Class[]> | null,
      subjects: null as any[] | null,
      users: null as InstituteUser[] | null
    };

    try {
      // Get cached institutes
      data.institutes = await cachedApiClient.getCachedOnly<Institute[]>(`/users/${userId}/institutes`);

      if (instituteId) {
        // Get cached classes
        data.classes = await cachedApiClient.getCachedOnly<ApiResponse<Class[]>>('/institute-classes', { instituteId });

        // Get cached subjects
        data.subjects = await cachedApiClient.getCachedOnly<any[]>(`/institute-class-subjects/institute/${instituteId}`);

        // Get cached users
        data.users = await cachedApiClient.getCachedOnly<InstituteUser[]>(`/institute-users/institute/${instituteId}/users`);
      }
    } catch (error) {
      console.warn('Error getting cached institute data:', error);
    }

    return data;
  }

  // Method to preload all institute data
  async preloadInstituteData(userId: string, instituteIds: string[]): Promise<void> {
    try {
      console.log('Preloading institute data for institutes:', instituteIds);

      // Preload user institutes first
      await cachedApiClient.preload<Institute[]>(`/users/${userId}/institutes`, undefined, 120);

      // Preload data for each institute
      const preloadPromises = instituteIds.map(async (instituteId) => {
        await Promise.all([
          cachedApiClient.preload('/institute-classes', { instituteId }, 60),
          cachedApiClient.preload(`/institute-class-subjects/institute/${instituteId}`, undefined, 60),
          cachedApiClient.preload(`/institute-users/institute/${instituteId}/users`, undefined, 30)
        ]);
      });

      await Promise.allSettled(preloadPromises);
      console.log('Institute data preloading completed');
    } catch (error) {
      console.warn('Error preloading institute data:', error);
    }
  }

  // Method to force refresh all institute data
  async refreshAllInstituteData(userId: string, instituteId?: string): Promise<void> {
    console.log('Force refreshing all institute data...', { userId, instituteId });
    
    // Refresh user institutes
    await this.getUserInstitutes(userId, true);
    
    if (instituteId) {
      // Refresh all data for the institute in parallel
      await Promise.all([
        this.getInstituteClasses(instituteId, undefined, true),
        this.getInstituteClassSubjects(instituteId, undefined, true),
        this.getInstituteUsers(instituteId, true)
      ]);
    }
  }
}

export const instituteApi = new InstituteApi();
