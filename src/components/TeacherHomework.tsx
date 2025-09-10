
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, BookOpen, Plus, Search, Filter, Calendar, Clock, FileText, Edit, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { DataCardView } from '@/components/ui/data-card-view';
import DataTable from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateHomeworkForm from '@/components/forms/CreateHomeworkForm';
import UpdateHomeworkForm from '@/components/forms/UpdateHomeworkForm';
import { useNavigate } from 'react-router-dom';

interface TeacherHomework {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  referenceLink?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  institute: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

interface HomeworkResponse {
  data: TeacherHomework[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const TeacherHomework = () => {
  const navigate = useNavigate();
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const { toast } = useToast();
  
  const [homework, setHomework] = useState<TeacherHomework[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  const [selectedHomework, setSelectedHomework] = useState<TeacherHomework | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const fetchHomework = async () => {
    if (!selectedInstitute?.id || !selectedClass?.id || !selectedSubject?.id || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        instituteId: selectedInstitute.id,
        classId: selectedClass.id,
        subjectId: selectedSubject.id,
        teacherId: user.id,
        page: '1',
        limit: '10'
      });

      const response = await fetch(
        `${getBaseUrl()}/institute-class-subject-homeworks?${params}`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data: HomeworkResponse = await response.json();
        setHomework(data.data || []);
        setDataLoaded(true);
        
        toast({
          title: "Homework Loaded",
          description: `Successfully loaded ${data.data?.length || 0} homework items.`
        });
      } else {
        throw new Error('Failed to fetch homework');
      }
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast({
        title: "Error",
        description: "Failed to load homework",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHomework = async (homeworkData: any) => {
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
        teacherId: user.id,
        title: homeworkData.title,
        description: homeworkData.description,
        startDate: homeworkData.startDate,
        endDate: homeworkData.endDate,
        referenceLink: homeworkData.referenceLink,
        isActive: true
      };

      const response = await fetch(
        `${getBaseUrl()}/institute-class-subject-homeworks`,
        {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify(createData)
        }
      );
      
      if (response.ok) {
        const newHomework = await response.json();
        
        toast({
          title: "Homework Created",
          description: `Homework "${newHomework.title}" has been created successfully.`
        });
        
        setIsCreateDialogOpen(false);
        fetchHomework(); // Refresh the list
      } else {
        throw new Error('Failed to create homework');
      }
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Error",
        description: "Failed to create homework",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Removed automatic API call - users must click Refresh to load data

  const handleEditHomework = (homework: TeacherHomework) => {
    setSelectedHomework(homework);
    setIsUpdateDialogOpen(true);
  };

  const handleViewSubmissions = (homework: TeacherHomework) => {
    navigate(`/homework/${homework.id}/submissions`);
  };

  const handleUpdateHomework = () => {
    setIsUpdateDialogOpen(false);
    setSelectedHomework(null);
    fetchHomework(); // Refresh the list
  };

  const homeworkColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (value: string, row: TeacherHomework) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500 truncate">{row.description}</div>
        </div>
      )
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'endDate',
      header: 'Due Date',
      render: (value: string | undefined) => value ? (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {new Date(value).toLocaleDateString()}
        </div>
      ) : '-'
    },
    {
      key: 'referenceLink',
      header: 'Reference',
      render: (value: string | undefined) => value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          View Link
        </a>
      ) : '-'
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: TeacherHomework) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewSubmissions(row)}
            className="flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleEditHomework(row)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
        </div>
      )
    }
  ];

  const filteredHomework = homework.filter(hw => {
    const matchesSearch = !searchTerm || 
      hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hw.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && hw.isActive) || 
      (statusFilter === 'inactive' && !hw.isActive);
    
    return matchesSearch && matchesStatus;
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
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Select Subject
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an institute, class, and subject to view homework.
          </p>
        </div>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Subject Homework
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Current Selection: {getCurrentSelection()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load your homework
          </p>
          <Button 
            onClick={fetchHomework} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Homework...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Load My Homework
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
            My Subject Homework
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current Selection: {getCurrentSelection()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {homework.length} Homework
          </Badge>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Homework
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
            onClick={fetchHomework} 
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
              Filter Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search homework..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredHomework.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Homework Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No homework matches your current filters.' 
                : 'No homework has been created for this subject yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={filteredHomework}
              columns={homeworkColumns}
              searchPlaceholder="Search homework..."
              allowAdd={false}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredHomework}
              columns={homeworkColumns}
              allowEdit={false}
              allowDelete={false}
            />
          </div>
        </>
      )}

      {/* Create Homework Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Homework</DialogTitle>
          </DialogHeader>
          <CreateHomeworkForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              fetchHomework();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Update Homework Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Homework</DialogTitle>
          </DialogHeader>
          {selectedHomework && (
            <UpdateHomeworkForm
              homework={selectedHomework}
              onClose={() => setIsUpdateDialogOpen(false)}
              onSuccess={handleUpdateHomework}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default TeacherHomework;
