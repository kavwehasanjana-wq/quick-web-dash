import { attendanceApiClient } from './attendanceClient';
import type { CachedRequestOptions } from './attendanceClient';

// ── Types ──────────────────────────────────────────────────────

export interface AdminAttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  userId?: string;
  userName?: string;
  instituteId: string;
  instituteName?: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  date?: string;
  markedAt?: string;
  status: string;
  location?: string;
  markingMethod?: string;
  eventId?: string;
  eventTitle?: string;
  calendarDayId?: string;
  userType?: string;
  instituteCardId?: string;
}

export interface AdminAttendanceResponse {
  success: boolean;
  message?: string;
  data: AdminAttendanceRecord[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary?: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalLeft: number;
    totalLeftEarly: number;
    totalLeftLately: number;
    attendanceRate: number;
  };
}

export interface CardUserResponse {
  success: boolean;
  data: {
    userId: string;
    userName: string;
    instituteCardId: string;
    imageUrl?: string;
    isActive: boolean;
    roles: string[];
  };
}

export type AdminUserType = 'STUDENT' | 'TEACHER' | 'INSTITUTE_ADMIN' | 'ATTENDANCE_MARKER' | 'PARENT' | 'NOT_ENROLLED';

// ── Helpers ────────────────────────────────────────────────────

/** Fetch attendance in ≤5-day windows (backend constraint) */
export async function fetchMultiWindow(
  endpoint: string,
  startDate: string,
  endDate: string,
  extraParams: Record<string, any> = {},
  options?: CachedRequestOptions
): Promise<AdminAttendanceRecord[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const allRecords: AdminAttendanceRecord[] = [];
  let windowStart = new Date(start);

  while (windowStart <= end) {
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 4); // 5-day window
    if (windowEnd > end) windowEnd.setTime(end.getTime());

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    try {
      const res = await attendanceApiClient.get<AdminAttendanceResponse>(endpoint, {
        startDate: fmt(windowStart),
        endDate: fmt(windowEnd),
        limit: 500,
        page: 1,
        ...extraParams,
      }, options);
      if (res?.data) allRecords.push(...res.data);
    } catch (e) {
      console.warn('Window fetch failed:', fmt(windowStart), '-', fmt(windowEnd), e);
    }

    windowStart.setDate(windowStart.getDate() + 5);
  }
  return allRecords;
}

// ── API ────────────────────────────────────────────────────────

const adminAttendanceApi = {
  /** Step 8: Institute-wide attendance (max 5-day range per call) */
  getInstituteAttendance(
    instituteId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/institute/${instituteId}`,
      params,
      options
    );
  },

  /** Step 8: Multi-window institute attendance */
  getInstituteAttendanceRange(
    instituteId: string,
    startDate: string,
    endDate: string,
    options?: CachedRequestOptions
  ) {
    return fetchMultiWindow(`/institute/${instituteId}`, startDate, endDate, {}, options);
  },

  /** Step 9: Attendance by user type */
  getAttendanceByUserType(
    instituteId: string,
    userType: AdminUserType,
    params?: { page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/calendar/institute/${instituteId}/user-type/${userType}`,
      params,
      options
    );
  },

  /** Step 10: Class attendance */
  getClassAttendance(
    instituteId: string,
    classId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/institute/${instituteId}/class/${classId}`,
      params,
      options
    );
  },

  /** Step 10: Subject attendance */
  getSubjectAttendance(
    instituteId: string,
    classId: string,
    subjectId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/institute/${instituteId}/class/${classId}/subject/${subjectId}`,
      params,
      options
    );
  },

  /** Step 13: Student attendance history */
  getStudentAttendance(
    studentId: string,
    params: { instituteId: string; startDate: string; endDate: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/student/${studentId}`,
      params,
      options
    );
  },

  /** Step 14: Look up user by institute card ID */
  getCardUser(
    instituteCardId: string,
    instituteId: string,
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<CardUserResponse>(
      `/institute-card-user`,
      { instituteCardId, instituteId },
      options
    );
  },

  /** Step 14: Attendance by system card ID */
  getAttendanceByCardId(
    cardId: string,
    params?: { page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/by-cardId/${cardId}`,
      params,
      options
    );
  },

  /** Calendar-linked: Attendance by event */
  getEventAttendance(
    instituteId: string,
    eventId: string,
    params?: { page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/calendar/institute/${instituteId}/event/${eventId}`,
      params,
      options
    );
  },

  /** Calendar-linked: Attendance by calendar day */
  getCalendarDayAttendance(
    instituteId: string,
    calendarDayId: string,
    params?: { page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AdminAttendanceResponse>(
      `/calendar/institute/${instituteId}/calendar-day/${calendarDayId}`,
      params,
      options
    );
  },
};

export default adminAttendanceApi;
