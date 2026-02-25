import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import calendarApi from '@/api/calendar.api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import CalendarDashboard from './CalendarDashboard';
import OperatingSchedule from './OperatingSchedule';
import GenerateCalendarWizard from './GenerateCalendarWizard';
import CalendarDayManagement from './CalendarDayManagement';
import EventManagement from './EventManagement';
import BulkDayUpdate from './BulkDayUpdate';
import CacheManagement from './CacheManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

const CalendarManagementPage: React.FC = () => {
  const { currentInstituteId, selectedInstitute } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteYear, setDeleteYear] = useState(new Date().getFullYear().toString());
  const [deleting, setDeleting] = useState(false);

  const handleDeleteCalendar = async () => {
    if (!currentInstituteId) return;
    setDeleting(true);
    try {
      const res = await calendarApi.deleteCalendar(currentInstituteId, deleteYear);
      toast.success(res?.message || 'Calendar deleted');
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete calendar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-bold text-foreground">📅 Calendar Management</h1>
          <p className="text-xs text-muted-foreground">{selectedInstitute?.name || 'Institute'}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
          <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
          <TabsTrigger value="generate" className="text-xs">Generate</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
          <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
          <TabsTrigger value="bulk" className="text-xs">Bulk</TabsTrigger>
          <TabsTrigger value="cache" className="text-xs">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CalendarDashboard onNavigate={setActiveTab} />
        </TabsContent>

        <TabsContent value="config">
          <OperatingSchedule />
        </TabsContent>

        <TabsContent value="generate">
          <div className="space-y-4">
            <GenerateCalendarWizard />
            {/* Delete Calendar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Delete an existing calendar to regenerate it with different settings.</p>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Year:</Label>
                  <Input value={deleteYear} onChange={e => setDeleteYear(e.target.value)} className="w-24 text-xs" />
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarDayManagement />
        </TabsContent>

        <TabsContent value="events">
          <EventManagement />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkDayUpdate />
        </TabsContent>

        <TabsContent value="cache">
          <CacheManagement />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Delete Calendar for {deleteYear}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all calendar days and events for {deleteYear}. All attendance linkages will be orphaned. This action cannot be undone!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCalendar} disabled={deleting} className="bg-destructive text-destructive-foreground">
              {deleting ? 'Deleting...' : 'Delete Calendar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarManagementPage;
