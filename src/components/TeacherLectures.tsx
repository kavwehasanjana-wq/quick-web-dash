
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Video, Plus, Search, Filter, Calendar, Clock, ExternalLink, MapPin, Users, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { DataCardView } from '@/components/ui/data-card-view';
import DataTable from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateLectureForm from '@/components/forms/CreateLectureForm';
import UpdateLectureForm from '@/components/forms/UpdateLectureForm';

interface TeacherLecture {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  instructorId: string;
  title: string;
  description: string;
  lectureType: 'physical' | 'online';
  venue?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  isRecorded: boolean;
  maxParticipants?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LectureResponse {
  data: TeacherLecture[];
  meta: {
    page: number;
    limit: string;
    total: string;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

const TeacherLectures = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const { toast } = useToast();
  
  const [lectures, setLectures] = useState<TeacherLecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<TeacherLecture | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Role check - only teachers can access this component
  if (user?.role !== 'Teacher') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Access denied. This section is only available for teachers.
        </p>
      </div>
    );
  }

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const fetchLectures = async () => {
    if (!selectedInstitute?.id || !selectedClass?.id || !selectedSubject?.id || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        instituteId: selectedInstitute.id,
        classId: selectedClass.id,
        subjectId: selectedSubject.id,
        instructorId: user.id
      });

      const response = await fetch(
        `${getBaseUrl()}/institute-class-subject-lectures?${params}`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data: LectureResponse = await response.json();
        setLectures(data.data);
        setDataLoaded(true);
        
        toast({
          title: "Lectures Loaded",
          description: `Successfully loaded ${data.data.length} lectures.`
        });
      } else {
        throw new Error('Failed to fetch lectures');
      }
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast({
        title: "Error",
        description: "Failed to load lectures",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecture = async (lectureData: any) => {
    if (!selectedInstitute?.id || !selectedClass?.id || !selectedSubject?.id || !user?.id) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const createData = {
        instituteId: selectedInstitute.id,
        classId: selectedClass.id,
        subjectId: selectedSubject.id,
        instructorId: user.id,
        lectures: {
          title: lectureData.title,
          lectureType: lectureData.lectureType,
          startTime: lectureData.startTime,
          endTime: lectureData.endTime,
          description: lectureData.description,
          venue: lectureData.venue,
          meetingLink: lectureData.meetingLink,
          meetingId: lectureData.meetingId,
          recodingUrl: lectureData.recordingUrl, // Note: API uses "recodingUrl" (typo in API)
          maxParticipants: lectureData.maxParticipants,
          meetingPassword: lectureData.meetingPassword
        }
      };

      const response = await fetch(
        `${getBaseUrl()}/institute-class-subject-lectures`,
        {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify(createData)
        }
      );
      
      if (response.ok) {
        const newLecture = await response.json();
        
        toast({
          title: "Lecture Created",
          description: `Lecture "${newLecture.title}" has been created successfully.`
        });
        
        setIsCreateDialogOpen(false);
        fetchLectures(); // Refresh the list
      } else {
        throw new Error('Failed to create lecture');
      }
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast({
        title: "Error",
        description: "Failed to create lecture",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditLecture = (lecture: TeacherLecture) => {
    setSelectedLecture(lecture);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateLecture = () => {
    setIsUpdateDialogOpen(false);
    setSelectedLecture(null);
    fetchLectures(); // Refresh the list
  };

  // Removed automatic API call - users must click Refresh to load data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const lectureColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (value: string, row: TeacherLecture) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500 truncate">{row.description}</div>
        </div>
      )
    },
    {
      key: 'lectureType',
      header: 'Type',
      render: (value: 'online' | 'physical') => (
        <Badge variant={value === 'online' ? 'default' : 'secondary'}>
          {value === 'online' ? (
            <>
              <ExternalLink className="h-3 w-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <MapPin className="h-3 w-3 mr-1" />
              Physical
            </>
          )}
        </Badge>
      )
    },
    {
      key: 'startTime',
      header: 'Start Time',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(value).toLocaleString()}
        </div>
      )
    },
    {
      key: 'endTime',
      header: 'End Time',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {new Date(value).toLocaleString()}
        </div>
      )
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (value: string | undefined) => value || '-'
    },
    {
      key: 'maxParticipants',
      header: 'Max Participants',
      render: (value: number | undefined) => value ? (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusColor(value)}>
          {value.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: TeacherLecture) => (
        <div className="flex items-center gap-2">
          {row.recordingUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(row.recordingUrl, '_blank')}
              className="flex items-center gap-1"
            >
              <Video className="h-3 w-3" />
              Recording
            </Button>
          )}
          <Button
            size="sm"
            variant="default"
            onClick={() => handleEditLecture(row)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
        </div>
      )
    }
  ];

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = !searchTerm || 
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lecture.venue && lecture.venue.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lecture.status === statusFilter;
    const matchesType = typeFilter === 'all' || lecture.lectureType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getCurrentSelection = () => {
    const parts = [];
    if (selectedInstitute) parts.push(`Institute: ${selectedInstitute.name}`);
    if (selectedClass) parts.push(`Class: ${selectedClass.name}`);
    if (selectedSubject) parts.push(`Subject: ${selectedSubject.name}`);
    return parts.join(' → ');
  };

  if (!selectedInstitute || !selectedClass || !selectedSubject) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Select Subject
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an institute, class, and subject to view lectures.
          </p>
        </div>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <Video className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Subject Lectures
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Current Selection: {getCurrentSelection()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load your lectures
          </p>
          <Button 
            onClick={fetchLectures} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Lectures...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Load My Lectures
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Subject Lectures
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current Selection: {getCurrentSelection()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            {lectures.length} Lectures
          </Badge>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Lecture
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            onClick={fetchLectures} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
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
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search lectures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredLectures.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Lectures Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No lectures match your current filters.' 
                : 'No lectures have been scheduled for this subject yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={filteredLectures}
              columns={lectureColumns}
              searchPlaceholder="Search lectures..."
              allowAdd={false}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredLectures}
              columns={lectureColumns}
              allowEdit={false}
              allowDelete={false}
            />
          </div>
        </>
      )}

      {/* Create Lecture Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lecture</DialogTitle>
          </DialogHeader>
          <CreateLectureForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              fetchLectures();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Update Lecture Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Lecture</DialogTitle>
          </DialogHeader>
          {selectedLecture && (
            <UpdateLectureForm
              lecture={selectedLecture}
              onClose={() => setIsUpdateDialogOpen(false)}
              onSuccess={handleUpdateLecture}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherLectures;
