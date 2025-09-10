
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, Filter, Calendar, User, Clock, CheckCircle, MapPin, School, BookOpen, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAttendanceUrl } from '@/contexts/utils/auth.api';

interface AttendanceRecord {
  attendanceId: string;
  studentId: string;
  studentName: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  markedAt: string;
  status: 'present' | 'absent' | 'late';
  markingMethod: string;
  markedBy: string;
}

interface AttendanceResponse {
  success: boolean;
  message: string;
  instituteInfo?: {
    instituteId: string;
    instituteName: string;
  };
  classInfo?: {
    instituteId: string;
    instituteName: string;
    classId: string;
    className: string;
  };
  subjectInfo?: {
    instituteId: string;
    instituteName: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  dateRange: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  data: AttendanceRecord[];
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    uniqueStudents: number;
    totalClasses?: number;
    totalSubjects?: number;
  };
}

const NewAttendance = () => {
  const { selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId, user } = useAuth();
  const { toast } = useToast();
  
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('2025-09-05');
  const [endDate, setEndDate] = useState('2025-09-10');
  const [sortOrder, setSortOrder] = useState<string>('descending');
  const [currentPage, setCurrentPage] = useState(1);

  // Check permissions based on role and context
  const getPermissionAndEndpoint = () => {
    const userRole = user?.role;
    const attendanceBaseUrl = getAttendanceUrl();
    
    if (!attendanceBaseUrl) {
      return {
        hasPermission: false,
        endpoint: '',
        title: 'Attendance Records - Backend URL Not Configured'
      };
    }
    
    // PRIORITY: Subject > Class > Institute based on current selection
    // 1) Subject-level attendance (InstituteAdmin and Teacher)
    if ((userRole === 'InstituteAdmin' || userRole === 'Teacher') &&
        currentInstituteId && currentClassId && currentSubjectId) {
      return {
        hasPermission: true,
        endpoint: `${attendanceBaseUrl}/api/attendance/institute/${currentInstituteId}/class/${currentClassId}/subject/${currentSubjectId}`,
        title: 'Subject Attendance Records'
      };
    }

    // 2) Class-level attendance (InstituteAdmin and Teacher)
    if ((userRole === 'InstituteAdmin' || userRole === 'Teacher') &&
        currentInstituteId && currentClassId) {
      return {
        hasPermission: true,
        endpoint: `${attendanceBaseUrl}/api/attendance/institute/${currentInstituteId}/class/${currentClassId}`,
        title: 'Class Attendance Records'
      };
    }

    // 3) Institute-level attendance (InstituteAdmin only)
    if (userRole === 'InstituteAdmin' && currentInstituteId) {
      return {
        hasPermission: true,
        endpoint: `${attendanceBaseUrl}/api/attendance/institute/${currentInstituteId}`,
        title: 'Institute Attendance Records'
      };
    }
    
    // Student - No permission to view attendance
    if (userRole === 'Student') {
      return {
        hasPermission: false,
        endpoint: '',
        title: 'Attendance Access Restricted'
      };
    }
    
    return {
      hasPermission: false,
      endpoint: '',
      title: 'Attendance Records'
    };
  };
  const { hasPermission, endpoint, title } = getPermissionAndEndpoint();

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'  // Add this header for ngrok
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const loadAttendanceData = async () => {
    if (!hasPermission) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view attendance records.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Loading attendance data from API:', endpoint);
    
    try {
      const headers = getApiHeaders();
      
      // Build query parameters
      const params = new URLSearchParams({
        startDate,
        endDate,
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const fullUrl = `${endpoint}?${params.toString()}`;
      console.log('Full API URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers
      });

      console.log('API Response Status:', response.status);
      console.log('Response Content-Type:', response.headers.get('Content-Type'));

      // Check if response is HTML (ngrok warning page)
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('text/html')) {
        const htmlContent = await response.text();
        
        // Check if it's an ngrok warning page
        if (htmlContent.includes('ngrok') && htmlContent.includes('You are about to visit')) {
          throw new Error('Ngrok tunnel is showing a browser warning. Please visit the ngrok URL in a browser first to accept the warning, or configure ngrok to skip browser warnings.');
        }
        
        throw new Error('API returned HTML instead of JSON. This might be a server configuration issue.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
          } else {
            errorMessage = await response.text() || errorMessage;
          }
        } catch {
          // Use default error message if parsing fails
        }
        
        throw new Error(`Failed to fetch attendance data: ${errorMessage}`);
      }

      let result: AttendanceResponse;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid JSON response from server. The server might be returning HTML or plain text instead of JSON.');
      }

      console.log('Attendance data loaded successfully:', result);
      
      setAttendanceData(result);
      setFilteredRecords(result.data);
      setDataLoaded(true);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${result.data.length} attendance records.`
      });
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to load attendance data from server.";
      
      if (errorMessage.includes('ngrok') || errorMessage.includes('browser warning')) {
        toast({
          title: "Ngrok Configuration Issue",
          description: "The ngrok tunnel is showing a browser warning. Visit the ngrok URL in a browser first to accept the warning.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('HTML instead of JSON')) {
        toast({
          title: "API Configuration Error",
          description: "The server is returning HTML instead of JSON. Check your API endpoint configuration.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Load Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load attendance data when page changes
  useEffect(() => {
    if (dataLoaded) {
      loadAttendanceData();
    }
  }, [currentPage]);

  // Apply filters and sorting
  useEffect(() => {
    if (!attendanceData) return;
    
    let filtered = attendanceData.data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.className && record.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.subjectName && record.subjectName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.markedAt);
      const dateB = new Date(b.markedAt);
      return sortOrder === 'ascending' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    setFilteredRecords(filtered);
  }, [attendanceData, searchTerm, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCurrentSelection = () => {
    const selections = [];
    if (selectedInstitute) selections.push(`Institute: ${selectedInstitute.name}`);
    if (selectedClass) selections.push(`Class: ${selectedClass.name}`);
    if (selectedSubject) selections.push(`Subject: ${selectedSubject.name}`);
    return selections.join(', ');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContextInfo = () => {
    if (attendanceData?.subjectInfo) {
      return `${attendanceData.subjectInfo.instituteName} > ${attendanceData.subjectInfo.className} > ${attendanceData.subjectInfo.subjectName}`;
    }
    if (attendanceData?.classInfo) {
      return `${attendanceData.classInfo.instituteName} > ${attendanceData.classInfo.className}`;
    }
    if (attendanceData?.instituteInfo) {
      return attendanceData.instituteInfo.instituteName;
    }
    return getCurrentSelection();
  };

  // Mobile Card Component
  const AttendanceCard = ({ record }: { record: AttendanceRecord }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {record.studentName}
          </CardTitle>
          <Badge className={getStatusColor(record.status)}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span>ID: {record.studentId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Time: {formatTime(record.markedAt)}</span>
          </div>
          {record.className && (
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-blue-600" />
              <span>Class: {record.className}</span>
            </div>
          )}
          {record.subjectName && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>Subject: {record.subjectName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Marked By: {record.markedBy}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-gray-500">
              {formatDate(record.markedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to view attendance records or haven't selected the required context.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Current Selection: {getContextInfo() || 'None'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Current Selection: {getContextInfo()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            View and manage attendance records
          </p>
          <Button 
            onClick={loadAttendanceData} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Data...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Attendance Data
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current Selection: {getContextInfo()}
          </p>
        </div>
        <Button 
          onClick={loadAttendanceData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={loadAttendanceData} disabled={isLoading}>
                Apply Filter
              </Button>
            </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="descending">Newest First</SelectItem>
                <SelectItem value="ascending">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {attendanceData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Present</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {attendanceData.summary.totalPresent}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {attendanceData.summary.totalAbsent}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Late</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceData.summary.totalLate}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(((attendanceData.summary.totalPresent + attendanceData.summary.totalLate) / 
                  (attendanceData.summary.totalPresent + attendanceData.summary.totalAbsent + attendanceData.summary.totalLate)) * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Records Summary */}
      {attendanceData && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRecords.length} of {attendanceData.pagination.totalRecords} records
            (Page {attendanceData.pagination.currentPage} of {attendanceData.pagination.totalPages})
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!attendanceData.pagination.hasPrevPage || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!attendanceData.pagination.hasNextPage || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No attendance records found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        No attendance records are available for the current selection.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record, index) => (
                    <TableRow key={record.attendanceId}>
                      <TableCell>{formatDate(record.markedAt)}</TableCell>
                      <TableCell>{formatTime(record.markedAt)}</TableCell>
                      <TableCell className="font-medium">{record.studentId}</TableCell>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>{record.className || '-'}</TableCell>
                      <TableCell>{record.subjectName || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.markedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No attendance records found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No attendance records are available for the current selection.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => (
              <AttendanceCard key={index} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAttendance;
