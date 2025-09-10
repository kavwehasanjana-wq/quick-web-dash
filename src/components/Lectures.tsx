import React, { useState } from 'react';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Filter, Plus, Calendar, Clock, MapPin, Video, Users, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CreateLectureForm from '@/components/forms/CreateLectureForm';
import UpdateLectureForm from '@/components/forms/UpdateLectureForm';
import { DataCardView } from '@/components/ui/data-card-view';
import { cachedApiClient } from '@/api/cachedClient';

interface LecturesProps {
  apiLevel?: 'institute' | 'class' | 'subject';
}

const Lectures = ({ apiLevel = 'institute' }: LecturesProps) => {
  const navigate = useNavigate();
  const { user, selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLectureData, setSelectedLectureData] = useState<any>(null);
  const [lecturesData, setLecturesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const buildQueryParams = () => {
    const userRole = (user?.role || 'Student') as UserRole;
    const params: Record<string, any> = {
      page: 1,
      limit: 100
    };

    // Add context-aware filtering
    if (currentInstituteId) {
      params.instituteId = currentInstituteId;
    }

    if (currentClassId) {
      params.classId = currentClassId;
    }

    if (currentSubjectId) {
      params.subjectId = currentSubjectId;
    }

    // For Teachers, add instructorId parameter
    if (userRole === 'Teacher' && user?.id) {
      params.instructorId = user.id;
    }

    // Add filter parameters
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (typeFilter !== 'all') {
      params.lectureType = typeFilter;
    }

    return params;
  };

  const handleLoadData = async (forceRefresh = false) => {
    const userRole = (user?.role || 'Student') as UserRole;
    let endpoint = '';
    const params = buildQueryParams();
    
    if (userRole === 'Student') {
      // For students: use the specific API endpoint with required parameters
      if (!currentInstituteId || !currentClassId || !currentSubjectId) {
        toast({
          title: "Missing Selection",
          description: "Please select institute, class, and subject to view lectures.",
          variant: "destructive"
        });
        return;
      }
      
      endpoint = '/institute-class-subject-lectures';
    } else if (userRole === 'InstituteAdmin' || userRole === 'Teacher') {
      // For InstituteAdmin and Teacher: use institute class subject lectures API
      if (currentInstituteId && currentClassId && currentSubjectId) {
        endpoint = '/institute-class-subject-lectures';
      } else {
        toast({
          title: "Missing Selection",
          description: "Please select institute, class, and subject to view lectures.",
          variant: "destructive"
        });
        return;
      }
    } else {
      // For other roles: use the original API
      endpoint = '/lectures';
    }

    setIsLoading(true);
    console.log(`Loading lectures data for role: ${userRole}`, { forceRefresh });
    console.log(`Current context - Institute: ${selectedInstitute?.name}, Class: ${selectedClass?.name}, Subject: ${selectedSubject?.name}`);
    
    try {
      console.log('Fetching lectures from endpoint:', endpoint, 'with params:', params);
      
      // Use cached API client
      const result = await cachedApiClient.get(endpoint, params, { 
        forceRefresh,
        ttl: 10 // Cache lectures for 10 minutes (they change frequently)
      });

      console.log('Lectures loaded successfully:', result);
      
      // Handle both array response and paginated response
      const lectures = Array.isArray(result) ? result : (result as any)?.data || [];
      setLecturesData(lectures);
      setDataLoaded(true);
      setLastRefresh(new Date());
      
      if (forceRefresh) {
        toast({
          title: "Data Refreshed",
          description: `Successfully refreshed ${lectures.length} lectures.`
        });
      }
    } catch (error) {
      console.error('Failed to load lectures:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load lectures data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    console.log('Force refreshing lectures data...');
    await handleLoadData(true);
  };

  const handleCreateLecture = async () => {
    setIsCreateDialogOpen(false);
    // Force refresh after creating new lecture
    await handleLoadData(true);
  };

  const handleEditLecture = async (lectureData: any) => {
    console.log('Opening update lecture dialog:', lectureData);
    setSelectedLectureData(lectureData);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLecture = async () => {
    setIsEditDialogOpen(false);
    setSelectedLectureData(null);
    // Force refresh after updating lecture
    await handleLoadData(true);
  };


  const handleDeleteLecture = async (lectureData: any) => {
    console.log('Deleting lecture:', lectureData);
    
    try {
      setIsLoading(true);
      
      // Use cached client for delete (will clear related cache)
      await cachedApiClient.delete(`/lectures/${lectureData.id}`);

      console.log('Lecture deleted successfully');
      
      toast({
        title: "Lecture Deleted",
        description: `Lecture ${lectureData.title} has been deleted successfully.`,
        variant: "destructive"
      });
      
      // Force refresh after deletion
      await handleLoadData(true);
      
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete lecture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLecture = (lectureData: any) => {
    console.log('View lecture:', lectureData);
    toast({
      title: "Lecture Viewed",
      description: `Viewing lecture: ${lectureData.title}`
    });
  };

  const userRole = (user?.role || 'Student') as UserRole;

  const lecturesColumns = [
    { key: 'title', header: 'Title' },
    { key: 'description', header: 'Description' },
    { key: 'lectureType', header: 'Type', render: (value: string) => <Badge variant="outline">{value}</Badge> },
    { key: 'venue', header: 'Venue' },
    { key: 'startTime', header: 'Start Time', render: (value: string) => new Date(value).toLocaleString() },
    { key: 'endTime', header: 'End Time', render: (value: string) => new Date(value).toLocaleString() },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'scheduled' ? 'default' : value === 'completed' ? 'secondary' : 'destructive'}>
          {value}
        </Badge>
      )
    },
    ...((['InstituteAdmin', 'Teacher', 'Student'] as UserRole[]).includes(userRole) ? [{
      key: 'meetingLink',
      header: 'Join Lecture',
      render: (value: string, row: any) => value ? (
        <Button
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => window.open(value, '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Join
        </Button>
      ) : (
        <span className="text-gray-400">No link</span>
      )
    }, {
      key: 'recordingUrl',
      header: 'Recording',
      render: (value: string, row: any) => {
        // Check multiple possible field names for recording URL
        const recUrl = value || row.recordingUrl || row.recording_url || row.recUrl || row.videoUrl || row.video_url;
        return recUrl ? (
          <Button
            size="sm"
            variant="default"
            style={{ backgroundColor: '#3338A0', color: 'white' }}
            className="hover:opacity-90"
            onClick={() => window.open(recUrl, '_blank')}
          >
            <Video className="h-3 w-3 mr-1" />
            View Rec
          </Button>
        ) : (
          <span className="text-gray-400">No recording</span>
        );
      }
    }] : [])
  ];

  const canAdd = AccessControl.hasPermission(userRole, 'create-lecture');
  const canEdit = userRole === 'Teacher' ? true : AccessControl.hasPermission(userRole, 'edit-lecture');
  const canDelete = userRole === 'Teacher' ? true : AccessControl.hasPermission(userRole, 'delete-lecture');

  const getTitle = () => {
    const contexts = [];
    
    if (selectedInstitute) {
      contexts.push(selectedInstitute.name);
    }
    
    if (selectedClass) {
      contexts.push(selectedClass.name);
    }
    
    if (selectedSubject) {
      contexts.push(selectedSubject.name);
    }
    
    let title = 'Lectures';
    if (contexts.length > 0) {
      title += ` (${contexts.join(' → ')})`;
    }
    
    return title;
  };

  // Filter the lectures based on local filters for mobile view
  const filteredLectures = lecturesData.filter(lecture => {
    const matchesSearch = !searchTerm || 
      Object.values(lecture).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || 
      lecture.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || 
      lecture.lectureType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {!dataLoaded ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {userRole === 'Student' && (!currentInstituteId || !currentClassId || !currentSubjectId)
              ? 'Please select institute, class, and subject to view lectures.'
              : 'Click the button below to load lectures data'
            }
          </p>
          <Button 
            onClick={() => handleLoadData(false)} 
            disabled={isLoading || (userRole === 'Student' && (!currentInstituteId || !currentClassId || !currentSubjectId))}
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
                Load Data
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getTitle()}
              </h1>
              {lastRefresh && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Last refreshed: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button 
                onClick={handleRefreshData} 
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
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Search Lectures
                </label>
                <Input
                  placeholder="Search lectures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
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
            </div>
          )}

          {/* Add Create Button for InstituteAdmin and Teacher */}
          {(userRole === 'InstituteAdmin' || userRole === 'Teacher') && canAdd && (
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Lecture
              </Button>
            </div>
          )}

           {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={lecturesData}
              columns={lecturesColumns}
              onAdd={canAdd ? () => setIsCreateDialogOpen(true) : undefined}
              onEdit={userRole === 'InstituteAdmin' ? handleEditLecture : undefined}
              onDelete={canDelete ? handleDeleteLecture : undefined}
              onView={undefined}
              allowEdit={userRole === 'InstituteAdmin'}
              allowDelete={canDelete}
              searchPlaceholder="Search lectures..."
              sectionType="lectures"
            />
          </div>

          {/* Mobile Card View - Always show cards */}
          <div className="md:hidden">
            <DataCardView
              data={filteredLectures}
              columns={lecturesColumns}
              onView={handleViewLecture}
              onEdit={canEdit ? handleEditLecture : undefined}
              onDelete={canDelete ? handleDeleteLecture : undefined}
              allowEdit={canEdit}
              allowDelete={canDelete}
            />
          </div>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lecture</DialogTitle>
          </DialogHeader>
          <CreateLectureForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={handleCreateLecture}
          />
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Lecture</DialogTitle>
          </DialogHeader>
          {selectedLectureData && (
            <UpdateLectureForm
              lecture={selectedLectureData}
              onClose={() => setIsEditDialogOpen(false)}
              onSuccess={handleUpdateLecture}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Lectures;
