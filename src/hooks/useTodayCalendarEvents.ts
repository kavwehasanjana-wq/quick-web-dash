import { useState, useEffect } from 'react';
import calendarApi from '@/api/calendar.api';

export interface CalendarEventOption {
  id: string;
  title: string;
  eventType: string;
  isDefault: boolean;
  isAttendanceTracked: boolean;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export interface TodayCalendarInfo {
  calendarDayId: string | null;
  defaultEventId: string | null;
  isAttendanceExpected: boolean;
  dayType: string;
  events: CalendarEventOption[];
  loading: boolean;
  error: string | null;
}

const DEFAULT_EVENT_ID = '__default__';

export { DEFAULT_EVENT_ID };

export function useTodayCalendarEvents(
  instituteId: string | null | undefined,
  classId?: string | null
): TodayCalendarInfo {
  const [info, setInfo] = useState<TodayCalendarInfo>({
    calendarDayId: null,
    defaultEventId: null,
    isAttendanceExpected: true,
    dayType: '',
    events: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!instituteId) return;

    let cancelled = false;
    setInfo(prev => ({ ...prev, loading: true, error: null }));

    const fetch = async () => {
      try {
        const res = classId
          ? await calendarApi.getClassToday(instituteId, classId)
          : await calendarApi.getToday(instituteId);

        if (cancelled) return;

        const data = res?.data;
        if (!data) {
          setInfo(prev => ({
            ...prev,
            loading: false,
            error: 'No calendar day found for today. Calendar may not be generated.',
          }));
          return;
        }

        const events: CalendarEventOption[] = (data.events || []).map((e: any) => ({
          id: e.id,
          title: e.title || e.eventType,
          eventType: e.eventType,
          isDefault: !!e.isDefault,
          isAttendanceTracked: e.isAttendanceTracked !== false,
          startTime: e.startTime,
          endTime: e.endTime,
          status: e.status,
        }));

        setInfo({
          calendarDayId: data.id || null,
          defaultEventId: data.defaultEventId || null,
          isAttendanceExpected: data.effectiveIsAttendanceExpected ?? data.isAttendanceExpected ?? true,
          dayType: data.effectiveDayType || data.dayType || '',
          events,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (cancelled) return;
        console.warn('Failed to fetch today calendar:', err);
        setInfo(prev => ({
          ...prev,
          loading: false,
          error: null, // Don't block attendance if calendar fails
        }));
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [instituteId, classId]);

  return info;
}
