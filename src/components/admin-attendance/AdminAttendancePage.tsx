import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminAttendanceOverview from './AdminAttendanceOverview';
import AttendanceByUserType from './AttendanceByUserType';
import ClassSubjectDrillDown from './ClassSubjectDrillDown';
import AdminDashboardCharts from './AdminDashboardCharts';
import CalendarAttendanceOverlay from './CalendarAttendanceOverlay';
import StudentAttendanceLookup from './StudentAttendanceLookup';
import CardManagement from './CardManagement';
import ExportReporting from './ExportReporting';
import AttendanceAlerts from './AttendanceAlerts';

const AdminAttendancePage: React.FC = () => {
  const { selectedInstitute } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-foreground">📊 Admin Attendance Monitoring</h1>
        <p className="text-xs text-muted-foreground">{selectedInstitute?.name || 'Institute'}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
          <TabsTrigger value="user-types" className="text-xs">By Type</TabsTrigger>
          <TabsTrigger value="drill-down" className="text-xs">Drill-Down</TabsTrigger>
          <TabsTrigger value="student" className="text-xs">Student</TabsTrigger>
          <TabsTrigger value="cards" className="text-xs">Cards</TabsTrigger>
          <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminAttendanceOverview />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminDashboardCharts />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarAttendanceOverlay />
        </TabsContent>

        <TabsContent value="user-types">
          <AttendanceByUserType />
        </TabsContent>

        <TabsContent value="drill-down">
          <ClassSubjectDrillDown />
        </TabsContent>

        <TabsContent value="student">
          <StudentAttendanceLookup />
        </TabsContent>

        <TabsContent value="cards">
          <CardManagement />
        </TabsContent>

        <TabsContent value="export">
          <ExportReporting />
        </TabsContent>

        <TabsContent value="alerts">
          <AttendanceAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAttendancePage;
