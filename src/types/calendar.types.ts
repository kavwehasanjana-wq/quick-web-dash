// Calendar Day Types
export type CalendarDayType =
  | 'REGULAR'
  | 'HALF_DAY'
  | 'EXAM_DAY'
  | 'STAFF_ONLY'
  | 'SPECIAL_EVENT'
  | 'CANCELLED'
  | 'PUBLIC_HOLIDAY'
  | 'INSTITUTE_HOLIDAY'
  | 'WEEKEND';

// Calendar Event Types
export type CalendarEventType =
  | 'REGULAR_CLASS'
  | 'EXAM'
  | 'PARENTS_MEETING'
  | 'SPORTS_DAY'
  | 'CULTURAL_EVENT'
  | 'FIELD_TRIP'
  | 'WORKSHOP'
  | 'ORIENTATION'
  | 'STAFF_MEETING'
  | 'TRAINING'
  | 'CUSTOM';

export type EventStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';

export type AttendanceOpenTo = 'TARGET_ONLY' | 'ALL_ENROLLED' | 'ANYONE';

export type TargetScope = 'INSTITUTE' | 'CLASS' | 'SUBJECT';

export type AttendanceUserType = 'STUDENT' | 'TEACHER' | 'PARENT' | 'STAFF';

// Operating Config
export interface OperatingConfig {
  dayOfWeek: number; // 1-7 (1=Monday)
  dayName?: string;
  isOperating: boolean;
  startTime: string | null; // "HH:MM"
  endTime: string | null;   // "HH:MM"
}

export interface OperatingConfigPayload {
  dayOfWeek: number;
  isOperating: boolean;
  startTime?: string;
  endTime?: string;
  academicYear: string;
}

export interface BulkOperatingConfigPayload {
  academicYear: string;
  configs: Array<{
    dayOfWeek: number;
    isOperating: boolean;
    startTime?: string;
    endTime?: string;
  }>;
}

// Calendar Day
export interface CalendarDay {
  id: string;
  calendarDate: string; // YYYY-MM-DD
  dayType: CalendarDayType;
  title?: string;
  description?: string;
  startTime?: string; // HH:MM:SS
  endTime?: string;   // HH:MM:SS
  isAttendanceExpected: boolean;
  academicYear?: string;
  dayOfWeek?: number;
}

export interface UpdateCalendarDayPayload {
  dayType?: CalendarDayType;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  isAttendanceExpected?: boolean;
}

// Calendar Event
export interface CalendarEvent {
  id: string;
  calendarDayId?: string;
  calendarDate?: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  isAttendanceTracked: boolean;
  isDefault: boolean;
  targetUserTypes?: AttendanceUserType[];
  attendanceOpenTo?: AttendanceOpenTo;
  targetScope?: TargetScope;
  targetClassIds?: string[];
  targetSubjectIds?: string[];
  venue?: string;
  meetingLink?: string;
  status: EventStatus;
  isMandatory: boolean;
  maxParticipants?: number;
  notes?: string;
}

export interface CreateEventPayload {
  calendarDayId?: string;
  calendarDate?: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  isAttendanceTracked?: boolean;
  isDefault?: boolean;
  targetUserTypes?: AttendanceUserType[];
  attendanceOpenTo?: AttendanceOpenTo;
  targetScope?: TargetScope;
  targetClassIds?: string[];
  targetSubjectIds?: string[];
  venue?: string;
  meetingLink?: string;
  status?: EventStatus;
  isMandatory?: boolean;
  maxParticipants?: number;
  notes?: string;
}

export interface UpdateEventPayload {
  eventType?: CalendarEventType;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  isAttendanceTracked?: boolean;
  targetUserTypes?: AttendanceUserType[];
  attendanceOpenTo?: AttendanceOpenTo;
  targetScope?: TargetScope;
  targetClassIds?: string[];
  targetSubjectIds?: string[];
  venue?: string;
  meetingLink?: string;
  status?: EventStatus;
  isMandatory?: boolean;
  maxParticipants?: number;
  notes?: string;
}

// Generate Calendar
export interface PublicHoliday {
  date: string;  // YYYY-MM-DD
  title: string;
}

export interface TermBreak {
  startDate: string;
  endDate: string;
  title: string;
}

export interface GenerateCalendarPayload {
  academicYear: string;
  startDate: string;
  endDate: string;
  publicHolidays: PublicHoliday[];
  termBreaks: TermBreak[];
}

export interface GenerateCalendarResponse {
  success: boolean;
  message: string;
  data: {
    academicYear: string;
    totalDays: number;
    breakdown: {
      regular: number;
      weekend: number;
      publicHoliday: number;
      instituteHoliday: number;
    };
    eventsCreated: number;
  };
}

// Cache Stats
export interface CacheStats {
  cacheEnabled: boolean;
  todayCacheKey: string;
  isCached: boolean;
  cachedAt?: string;
  ttlRemaining?: number;
}

// API Response wrapper
export interface CalendarApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
}
