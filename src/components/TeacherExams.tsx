import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, FileText, Plus, Search, Filter, Calendar, Clock, ExternalLink, MapPin, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { DataCardView } from '@/components/ui/data-card-view';
import DataTable from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateExamForm from '@/components/forms/CreateExamForm';
import CreateResultsForm from '@/components/forms/CreateResultsForm';
import { UpdateExamForm } from '@/components/forms/UpdateExamForm';
import { ExamResultsDialog } from '@/components/ExamResultsDialog';

interface TeacherExam {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  examType: 'online' | 'physical';
  durationMinutes: number;
  totalMarks: string;
  passingMarks: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  venue?: string;
  examLink?: string;
  instructions?: string;
  status: 'scheduled' | 'draft' | 'completed' | 'cancelled';
  createdBy: string;
  toWhom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  institute: {};
  class: {};
  subject: {};
  creator: {};
}

interface ExamResponse {
  data: TeacherExam[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

const TeacherExams = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const { toast } = useToast();
  
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateResultsDialogOpen, setIsCreateResultsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<TeacherExam | null>(null);
  const [isExamResultsDialogOpen, setIsExamResultsDialogOpen] = useState(false);
  
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

  const fetchExams = async () => {
    if (!selectedInstitute?.id || !selectedClass?.id || !selectedSubject?.id || !user?.id) {
      toast({
        title: "Missing Selection",
        description: "Please select institute, class, and subject first.",
        variant: "destructive"
      });
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

      console.log('Fetching teacher exams with params:', Object.fromEntries(params));

      const response = await fetch(
        `${getBaseUrl()}/institute-class-subject-exams?${params}`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data: ExamResponse = await response.json();
        console.log('Teacher exams response:', data);
        setExams(data.data);
        setDataLoaded(true);
        
        toast({
          title: "My Exams Loaded",
          description: `Successfully loaded ${data.data.length} of your exams.`
        });
      } else {
        throw new Error('Failed to fetch teacher exams');
      }
    } catch (error) {
      console.error('Error fetching teacher exams:', error);
      toast({
        title: "Error",
        description: "Failed to load your exams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (examData: any) => {
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
        title: examData.title,
        description: examData.description,
        examType: examData.examType,
        duration: examData.duration,
        maxMarks: examData.maxMarks,
        passingMarks: examData.passingMarks,
        examDate: examData.examDate,
        startTime: examData.startTime,
        endTime: examData.endTime,
        venue: examData.venue,
        examLink: examData.examLink,
        instructions: examData.instructions,
        status: 'scheduled',
        createdBy: user.id,
        toWhom: 'everyone',
        isActive: true
      };

      const response = await fetch(
        `${getBaseUrl()}/institute-class-subject-exams`,
        {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify(createData)
        }
      );
      
      if (response.ok) {
        const newExam = await response.json();
        
        toast({
          title: "Exam Created",
          description: `Exam "${newExam.title}" has been created successfully.`
        });
        
        setIsCreateDialogOpen(false);
        fetchExams(); // Refresh the list
      } else {
        throw new Error('Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResults = () => {
    console.log('Create results clicked');
    setIsCreateResultsDialogOpen(true);
  };

  const handleViewExam = (exam: TeacherExam) => {
    setSelectedExam(exam);
    setIsExamResultsDialogOpen(true);
  };

  const handleEditExam = (exam: TeacherExam) => {
    setSelectedExam(exam);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateExam = () => {
    setIsUpdateDialogOpen(false);
    setSelectedExam(null);
    fetchExams(); // Refresh the list
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const examColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (value: string, row: TeacherExam) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500 truncate">{row.description}</div>
        </div>
      )
    },
    {
      key: 'examType',
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
      key: 'durationMinutes',
      header: 'Duration',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatDuration(value)}
        </div>
      )
    },
    {
      key: 'totalMarks',
      header: 'Marks',
      render: (value: string, row: TeacherExam) => `${value}/${row.passingMarks}`
    },
    {
      key: 'scheduleDate',
      header: 'Date',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (value: string | undefined) => value || '-'
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
      render: (value: any, row: TeacherExam) => (
        <div className="flex items-center gap-2">
          {row.examLink && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(row.examLink, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Exam Link
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewExam(row)}
            className="flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            View
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleEditExam(row)}
            className="flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            Edit
          </Button>
        </div>
      )
    }
  ];

  const filteredExams = exams.filter(exam => {
    const matchesSearch = !searchTerm || 
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.venue && exam.venue.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesType = typeFilter === 'all' || exam.examType === typeFilter;
    
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
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Select Subject
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an institute, class, and subject to view your exams.
          </p>
        </div>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Subject Exams
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Current Selection: {getCurrentSelection()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load your exams for this subject
          </p>
          <Button 
            onClick={fetchExams} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading My Exams...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Load My Exams
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
            My Subject Exams
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current Selection: {getCurrentSelection()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {exams.length} My Exams
          </Badge>
          <Button 
            onClick={handleCreateResults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Create Results
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
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
            onClick={fetchExams} 
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
              Filter Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exams..."
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
                  <SelectItem value="draft">Draft</SelectItem>
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

      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Exams Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No exams match your current filters.' 
                : 'You have not created any exams for this subject yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={filteredExams}
              columns={examColumns}
              searchPlaceholder="Search my exams..."
              allowAdd={false}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredExams}
              columns={examColumns}
              allowEdit={false}
              allowDelete={false}
            />
          </div>
        </>
      )}

      {/* Create Exam Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
          </DialogHeader>
          <CreateExamForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              fetchExams();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Create Results Dialog */}
      <Dialog open={isCreateResultsDialogOpen} onOpenChange={setIsCreateResultsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Results</DialogTitle>
          </DialogHeader>
          <CreateResultsForm
            onClose={() => setIsCreateResultsDialogOpen(false)}
            onSuccess={() => {
              setIsCreateResultsDialogOpen(false);
              fetchExams();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Update Exam Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Exam</DialogTitle>
          </DialogHeader>
          {selectedExam && (
            <UpdateExamForm
              exam={selectedExam}
              onClose={() => setIsUpdateDialogOpen(false)}
              onSuccess={handleUpdateExam}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Exam Results Dialog */}
      <ExamResultsDialog
        isOpen={isExamResultsDialogOpen}
        onClose={() => {
          setIsExamResultsDialogOpen(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
      />
    </div>
  );
};

export default TeacherExams;
