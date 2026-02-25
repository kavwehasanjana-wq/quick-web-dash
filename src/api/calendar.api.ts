import { apiClient } from './client';
import type {
  OperatingConfig,
  BulkOperatingConfigPayload,
  CalendarDay,
  UpdateCalendarDayPayload,
  CalendarEvent,
  CreateEventPayload,
  UpdateEventPayload,
  GenerateCalendarPayload,
  GenerateCalendarResponse,
  CacheStats,
  CalendarApiResponse,
} from '@/types/calendar.types';

const calendarApi = {
  // ── Operating Config ──────────────────────────────────────────
  getOperatingConfig(instituteId: string) {
    return apiClient.get<CalendarApiResponse<OperatingConfig[]>>(
      `/institutes/${instituteId}/calendar/operating-config`
    );
  },

  saveOperatingConfigBulk(instituteId: string, payload: BulkOperatingConfigPayload) {
    return apiClient.post<CalendarApiResponse<OperatingConfig[]>>(
      `/institutes/${instituteId}/calendar/operating-config/bulk`,
      payload
    );
  },

  // ── Generate / Delete Calendar ────────────────────────────────
  generateCalendar(instituteId: string, payload: GenerateCalendarPayload) {
    return apiClient.post<GenerateCalendarResponse>(
      `/institutes/${instituteId}/calendar/generate`,
      payload
    );
  },

  deleteCalendar(instituteId: string, academicYear: string) {
    return apiClient.delete<CalendarApiResponse<{ deletedDays: number; deletedEvents: number }>>(
      `/institutes/${instituteId}/calendar/${academicYear}`
    );
  },

  // ── Today ─────────────────────────────────────────────────────
  getToday(instituteId: string) {
    return apiClient.get<CalendarApiResponse<CalendarDay>>(
      `/institutes/${instituteId}/calendar/today`
    );
  },

  // ── Calendar Days ─────────────────────────────────────────────
  getDays(instituteId: string, params?: Record<string, any>) {
    return apiClient.get<CalendarApiResponse<CalendarDay[]>>(
      `/institutes/${instituteId}/calendar/days`,
      params
    );
  },

  updateDay(instituteId: string, dayId: string, payload: UpdateCalendarDayPayload) {
    return apiClient.patch<CalendarApiResponse<CalendarDay>>(
      `/institutes/${instituteId}/calendar/days/${dayId}`,
      payload
    );
  },

  deleteDay(instituteId: string, dayId: string) {
    return apiClient.delete<CalendarApiResponse<null>>(
      `/institutes/${instituteId}/calendar/days/${dayId}`
    );
  },

  // ── Events ────────────────────────────────────────────────────
  getEvents(instituteId: string, params?: Record<string, any>) {
    return apiClient.get<CalendarApiResponse<CalendarEvent[]>>(
      `/institutes/${instituteId}/calendar/events`,
      params
    );
  },

  getDayEvents(instituteId: string, dayId: string) {
    return apiClient.get<CalendarApiResponse<CalendarEvent[]>>(
      `/institutes/${instituteId}/calendar/days/${dayId}/events`
    );
  },

  createEvent(instituteId: string, payload: CreateEventPayload) {
    return apiClient.post<CalendarApiResponse<CalendarEvent>>(
      `/institutes/${instituteId}/calendar/events`,
      payload
    );
  },

  updateEvent(instituteId: string, eventId: string, payload: UpdateEventPayload) {
    return apiClient.patch<CalendarApiResponse<CalendarEvent>>(
      `/institutes/${instituteId}/calendar/events/${eventId}`,
      payload
    );
  },

  deleteEvent(instituteId: string, eventId: string) {
    return apiClient.delete<CalendarApiResponse<null>>(
      `/institutes/${instituteId}/calendar/events/${eventId}`
    );
  },

  // ── Cache ─────────────────────────────────────────────────────
  getCacheStats(instituteId: string) {
    return apiClient.get<CalendarApiResponse<CacheStats>>(
      `/institutes/${instituteId}/calendar/cache/stats`
    );
  },

  invalidateCache(instituteId: string) {
    return apiClient.post<CalendarApiResponse<null>>(
      `/institutes/${instituteId}/calendar/cache/invalidate`
    );
  },
};

export default calendarApi;
