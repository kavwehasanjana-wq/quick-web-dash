import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import calendarApi from '@/api/calendar.api';
import type { CalendarEvent, CreateEventPayload, CalendarEventType, EventStatus, AttendanceOpenTo, TargetScope, AttendanceUserType } from '@/types/calendar.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';

const EVENT_TYPES: CalendarEventType[] = ['REGULAR_CLASS', 'EXAM', 'PARENTS_MEETING', 'SPORTS_DAY', 'CULTURAL_EVENT', 'FIELD_TRIP', 'WORKSHOP', 'ORIENTATION', 'STAFF_MEETING', 'TRAINING', 'CUSTOM'];
const EVENT_STATUSES: EventStatus[] = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED'];
const ATTENDANCE_OPEN_TO: AttendanceOpenTo[] = ['TARGET_ONLY', 'ALL_ENROLLED', 'ANYONE'];
const TARGET_SCOPES: TargetScope[] = ['INSTITUTE', 'CLASS', 'SUBJECT'];
const USER_TYPES: AttendanceUserType[] = ['STUDENT', 'TEACHER', 'PARENT', 'STAFF'];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-500',
  ONGOING: 'bg-green-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
  POSTPONED: 'bg-yellow-500',
};

const EventManagement: React.FC = () => {
  const { currentInstituteId } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const emptyForm: CreateEventPayload = {
    eventType: 'CUSTOM',
    title: '',
    eventDate: new Date().toISOString().split('T')[0],
    startTime: '08:00:00',
    endTime: '15:00:00',
    isAllDay: false,
    isAttendanceTracked: true,
    isDefault: false,
    targetUserTypes: ['STUDENT'],
    attendanceOpenTo: 'TARGET_ONLY',
    targetScope: 'INSTITUTE',
    status: 'SCHEDULED',
    isMandatory: false,
  };
  const [form, setForm] = useState<CreateEventPayload>(emptyForm);

  useEffect(() => {
    if (currentInstituteId) loadEvents();
  }, [currentInstituteId, filterDate]);

  const loadEvents = async () => {
    if (!currentInstituteId) return;
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: 50 };
      if (filterDate) params.eventDate = filterDate;
      const res = await calendarApi.getEvents(currentInstituteId, params);
      setEvents(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!currentInstituteId || !form.title?.trim()) { toast.error('Title is required'); return; }
    if (!form.eventDate) { toast.error('Event date is required'); return; }
    setSaving(true);
    try {
      await calendarApi.createEvent(currentInstituteId, form);
      toast.success('Event created!');
      setShowCreate(false);
      setForm(emptyForm);
      loadEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentInstituteId || !editEvent) return;
    setSaving(true);
    try {
      await calendarApi.updateEvent(currentInstituteId, editEvent.id, {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        status: form.status,
        notes: form.notes,
        venue: form.venue,
        isMandatory: form.isMandatory,
        isAttendanceTracked: form.isAttendanceTracked,
      });
      toast.success('Event updated!');
      setEditEvent(null);
      loadEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentInstituteId || !deleteId) return;
    try {
      await calendarApi.deleteEvent(currentInstituteId, deleteId);
      toast.success('Event deleted!');
      setDeleteId(null);
      loadEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const openEdit = (event: CalendarEvent) => {
    setEditEvent(event);
    setForm({
      ...emptyForm,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status,
      notes: event.notes,
      venue: event.venue,
      isMandatory: event.isMandatory,
      isAttendanceTracked: event.isAttendanceTracked,
      eventDate: event.eventDate,
      eventType: event.eventType,
    });
  };

  const toggleUserType = (type: AttendanceUserType) => {
    const current = form.targetUserTypes || [];
    setForm({
      ...form,
      targetUserTypes: current.includes(type) ? current.filter(t => t !== type) : [...current, type],
    });
  };

  const renderForm = (isEdit: boolean) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Event Type</Label>
          <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v as CalendarEventType })} disabled={isEdit}>
            <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EventStatus })}>
            <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Title *</Label>
        <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 text-xs" />
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 text-xs" rows={2} />
      </div>
      <div>
        <Label className="text-xs">Venue</Label>
        <Input value={form.venue || ''} onChange={e => setForm({ ...form, venue: e.target.value })} className="mt-1 text-xs" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Date</Label>
          <Input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="mt-1 text-xs" disabled={isEdit} />
        </div>
        <div>
          <Label className="text-xs">Start</Label>
          <Input type="time" value={form.startTime?.slice(0, 5) || ''} onChange={e => setForm({ ...form, startTime: e.target.value + ':00' })} className="mt-1 text-xs" />
        </div>
        <div>
          <Label className="text-xs">End</Label>
          <Input type="time" value={form.endTime?.slice(0, 5) || ''} onChange={e => setForm({ ...form, endTime: e.target.value + ':00' })} className="mt-1 text-xs" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={form.isAttendanceTracked ?? true} onCheckedChange={v => setForm({ ...form, isAttendanceTracked: v })} />
          <Label className="text-xs">Track Attendance</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.isMandatory ?? false} onCheckedChange={v => setForm({ ...form, isMandatory: v })} />
          <Label className="text-xs">Mandatory</Label>
        </div>
      </div>

      {!isEdit && (
        <>
          <div>
            <Label className="text-xs">Attendance Open To</Label>
            <Select value={form.attendanceOpenTo} onValueChange={(v) => setForm({ ...form, attendanceOpenTo: v as AttendanceOpenTo })}>
              <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ATTENDANCE_OPEN_TO.map(a => <SelectItem key={a} value={a} className="text-xs">{a.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Target Scope</Label>
            <Select value={form.targetScope} onValueChange={(v) => setForm({ ...form, targetScope: v as TargetScope })}>
              <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TARGET_SCOPES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-2 block">Target User Types</Label>
            <div className="flex flex-wrap gap-3">
              {USER_TYPES.map(ut => (
                <div key={ut} className="flex items-center gap-1">
                  <Checkbox checked={form.targetUserTypes?.includes(ut)} onCheckedChange={() => toggleUserType(ut)} />
                  <span className="text-xs">{ut}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1 text-xs" rows={2} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-40 text-xs h-8" placeholder="Filter by date" />
          {filterDate && <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setFilterDate('')}>Clear</Button>}
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setShowCreate(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Create Event
        </Button>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No events found. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <Card key={event.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{event.title}</span>
                      <Badge variant="outline" className="text-[10px]">{event.eventType.replace(/_/g, ' ')}</Badge>
                      <Badge className={`text-[10px] text-white ${STATUS_COLORS[event.status] || 'bg-gray-500'}`}>{event.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.eventDate}</span>
                      {event.startTime && <span>{event.startTime.slice(0, 5)}-{event.endTime?.slice(0, 5)}</span>}
                      {event.venue && <span>📍 {event.venue}</span>}
                    </div>
                    {event.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</p>}
                    <div className="flex gap-2 mt-1">
                      {event.isAttendanceTracked && <Badge variant="outline" className="text-[10px]">Tracked</Badge>}
                      {event.isMandatory && <Badge variant="outline" className="text-[10px]">Mandatory</Badge>}
                      {event.targetScope && <Badge variant="outline" className="text-[10px]">{event.targetScope}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(event)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {!event.isDefault && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(event.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-base">📋 Create New Event</DialogTitle></DialogHeader>
          {renderForm(false)}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Event'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editEvent} onOpenChange={(open) => !open && setEditEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-base">✏️ Edit Event</DialogTitle></DialogHeader>
          {renderForm(true)}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditEvent(null)}>Cancel</Button>
            <Button size="sm" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventManagement;
