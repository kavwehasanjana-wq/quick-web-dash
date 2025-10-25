import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataCardView } from '@/components/ui/data-card-view';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { School, Users, BookOpen, Clock, RefreshCw, User, Search, Filter, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { Input } from '@/components/ui/input';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cachedApiClient } from '@/api/cachedClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { instituteClassesApi, type EnrollClassData } from '@/api/instituteClasses.api';

const enrollFormSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  enrollmentCode: z.string().min(1, 'Enrollment code is required'),
});

interface ClassData {
  id: string;
  name: string;
  code: string;
  grade?: number;
  level?: number;
  capacity?: number;
  enrollmentCode?: string;
  academicYear?: string;
  specialty?: string;
  classType?: string;
  description?: string;
  classTeacherId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  instituteId?: string;
  imageUrl?: string;
  _count?: {
    students: number;
    subjects: number;
  };
}

interface StudentClassData {
  instituteId: string;
  classId: string;
  isActive: boolean;
  isVerified: boolean;
  enrolledAt: string;
  class: {
    id: string;
    name: string;
    code: string;
    grade: number;
    specialty: string;
    academicYear: string;
    classType: string;
    imageUrl?: string;
  };
}

interface StudentEnrolledClassData {
  ics_institute_id: string;
  ics_institute_class_id: string;
  ics_student_user_id: string;
  ics_is_active: number;
  ics_is_verified: number;
  ics_enrollment_method: string;
  ics_verified_by: string | null;
  ics_verified_at: string | null;
  enrolledAt: string;
  className: string;
  classDescription: string;
  classCode: string;
  grade: number;
  teacher_id: string;
  specialty: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  instituteName: string;
  instituteCode: string;
}

interface TeacherClassSubjectData {
  instituteId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
    code: string;
    classTeacherId?: string;
  };
  isActive: boolean;
  schedule?: any;
  notes?: any;
  createdAt: string;
  updatedAt: string;
}

interface ClassCardData {
  id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  studentCount: number;
  subjectCount: number;
  academicYear: string;
  specialty: string;
  classType: string;
  isActive: boolean;
  imageUrl?: string;
}

const ClassSelector = () => {
  const { user, selectedInstitute, setSelectedClass, currentInstituteId } = useAuth();
  const { toast } = useToast();
  const effectiveRole = useInstituteRole();
  const [classesData, setClassesData] = useState<ClassCardData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const enrollForm = useForm<z.infer<typeof enrollFormSchema>>({
    resolver: zodResolver(enrollFormSchema),
    defaultValues: {
      classId: '',
      enrollmentCode: '',
    },
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [classTypeFilter, setClassTypeFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchClassesByRole = async (page: number = 1, limit: number = 10, forceRefresh = false) => {
    if (!currentInstituteId) return;

    setIsLoading(true);
    console.log('Loading classes data for institute role:', effectiveRole, { page, limit, forceRefresh, dataLoaded });
    
    try {
      let endpoint = '';
      let params: Record<string, any> = {};
      
      if (effectiveRole === 'Student') {
        // Use the new student-specific endpoint
        endpoint = `/institute-classes/${currentInstituteId}/student/${user?.id}`;
        params = { 
          page: page, 
          limit: limit 
        };
      } else if (effectiveRole === 'Teacher') {
        endpoint = `/institute-classes/${currentInstituteId}/teacher/${user?.id}`;
        params = { page, limit };
      } else if (effectiveRole === 'InstituteAdmin' || effectiveRole === 'AttendanceMarker') {
        endpoint = `/institute-classes/institute/${currentInstituteId}`;
        params = {};
      } else {
        throw new Error('Unsupported user role for class selection');
      }

      console.log(`Making API call for ${endpoint}:`, params);
      
      // Use cached API client which will handle caching and proper base URL
      const result = await cachedApiClient.get(endpoint, params, { 
        forceRefresh,
        ttl: 60 // Cache for 1 hour
      });

      console.log('Raw API response:', result);
      processClassesData(result, effectiveRole, page);
      
    } catch (error) {
      console.error('Failed to load classes:', error);
      
      // Fallback: try alternative endpoint for admin users (not for students)
      if ((effectiveRole === 'InstituteAdmin' || effectiveRole === 'AttendanceMarker') && !forceRefresh) {
        try {
          console.log('Trying alternative endpoint...');
          const fallbackEndpoint = '/classes';
          const fallbackParams = { instituteId: currentInstituteId, page, limit };
          
          const fallbackResult = await cachedApiClient.get(fallbackEndpoint, fallbackParams, { 
            forceRefresh,
            ttl: 60 
          });
          
          console.log('Fallback API response:', fallbackResult);
          processClassesData(fallbackResult, effectiveRole, page);
          return;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
      
      toast({
        title: "Load Failed",
        description: "Failed to load classes data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processClassesData = (result: any, userRole: UserRole, page: number) => {
    let classesArray: ClassData[] = [];
    let pagination = { total: 0, totalPages: 1 };
    
    // Extract pagination info if available
    if (result.meta) {
      pagination.total = result.meta.total || 0;
      pagination.totalPages = result.meta.totalPages || 1;
    }
    
    if (userRole === 'Student') {
      // Handle new student classes response
      let studentClasses: StudentClassData[] = [];
      
      if (Array.isArray(result)) {
        studentClasses = result;
        pagination.total = result.length;
        pagination.totalPages = 1;
      } else if (result.data && Array.isArray(result.data)) {
        studentClasses = result.data;
        // Handle new pagination structure from API response
        pagination.total = result.total || result.data.length;
        pagination.totalPages = result.totalPages || Math.ceil(pagination.total / (result.limit || 10));
      }

      classesArray = studentClasses.map((item: StudentClassData): ClassData => ({
        id: item.class.id,
        name: item.class.name,
        code: item.class.code,
        description: `${item.class.name} - ${item.class.specialty}`,
        specialty: item.class.specialty,
        classType: item.class.classType,
        academicYear: item.class.academicYear,
        isActive: item.isActive,
        capacity: 0, // Not provided in student response
        grade: item.class.grade,
        instituteId: item.instituteId,
        imageUrl: item.class.imageUrl, // Now includes imageUrl from response
        _count: {
          students: 0, // Not provided in student response
          subjects: 0  // Not provided in student response
        }
      }));
    } else if (userRole === 'Teacher') {
      // Handle new teacher classes response with proper pagination
      let teacherClassAssignments: any[] = [];
      
      if (Array.isArray(result)) {
        teacherClassAssignments = result;
        pagination.total = result.length;
        pagination.totalPages = 1;
      } else if (result.data && Array.isArray(result.data)) {
        teacherClassAssignments = result.data;
        // Use the new response structure pagination
        pagination.total = result.total || result.data.length;
        pagination.totalPages = result.totalPages || Math.ceil(pagination.total / (result.limit || 10));
      }

      // Remove duplicates by class ID - keep the first occurrence
      const uniqueClasses = new Map();
      teacherClassAssignments.forEach((item: any) => {
        if (!uniqueClasses.has(item.class.id)) {
          uniqueClasses.set(item.class.id, item);
        }
      });

      classesArray = Array.from(uniqueClasses.values()).map((item: any): ClassData => ({
        id: item.class.id,
        name: item.class.name,
        code: item.class.code,
        description: `${item.class.name} - ${item.class.specialty} (${item.teacherRole})`,
        specialty: item.class.specialty,
        classType: item.class.classType,
        academicYear: item.class.academicYear,
        isActive: item.isActive,
        capacity: 0, // Not provided in teacher response
        grade: item.class.grade,
        instituteId: item.instituteId,
        imageUrl: item.class.imageUrl,
        _count: {
          students: 0, // Not provided in teacher response
          subjects: 0  // Not provided in teacher response
        }
      }));
    } else {
      if (Array.isArray(result)) {
        classesArray = result;
        pagination.total = result.length;
        pagination.totalPages = 1;
      } else if (result.data && Array.isArray(result.data)) {
        classesArray = result.data;
        if (result.meta) {
          pagination.total = result.meta.total || result.data.length;
          pagination.totalPages = result.meta.totalPages || 1;
        }
      } else {
        console.warn('Unexpected response structure:', result);
        classesArray = [];
      }
    }

    const transformedClasses = classesArray.map((classItem: ClassData): ClassCardData => ({
      id: classItem.id,
      name: classItem.name,
      code: classItem.code,
      description: classItem.description || `${classItem.name} - ${classItem.specialty || classItem.classType || 'General'}`,
      capacity: classItem.capacity || 0,
      studentCount: classItem._count?.students || 0,
      subjectCount: classItem._count?.subjects || 0,
      academicYear: classItem.academicYear || 'N/A',
      specialty: classItem.specialty || classItem.classType || 'General',
      classType: classItem.classType || 'Regular',
      isActive: classItem.isActive !== false,
      imageUrl: classItem.imageUrl
    }));

    console.log('Transformed classes:', transformedClasses);
    setClassesData(transformedClasses);
    setFilteredClasses(transformedClasses);
    setTotalItems(pagination.total);
    setTotalPages(pagination.totalPages);
    setCurrentPage(page);
    setDataLoaded(true);
    
    toast({
      title: "Classes Loaded",
      description: `Successfully loaded ${transformedClasses.length} classes.`
    });
  };

  useEffect(() => {
    let filtered = classesData;

    if (searchTerm) {
      filtered = filtered.filter(classItem =>
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(classItem =>
        classItem.name.toLowerCase().includes(`grade ${gradeFilter}`) ||
        classItem.description.toLowerCase().includes(`grade ${gradeFilter}`)
      );
    }

    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(classItem => 
        classItem.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    }

    if (classTypeFilter !== 'all') {
      filtered = filtered.filter(classItem => 
        classItem.classType.toLowerCase().includes(classTypeFilter.toLowerCase())
      );
    }

    if (academicYearFilter !== 'all') {
      filtered = filtered.filter(classItem => 
        classItem.academicYear === academicYearFilter
      );
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(classItem => classItem.isActive === isActive);
    }

    setFilteredClasses(filtered);
  }, [classesData, searchTerm, gradeFilter, specialtyFilter, classTypeFilter, academicYearFilter, statusFilter]);

  const handleSelectClass = (classData: ClassCardData) => {
    console.log('Selecting class - no additional API calls will be made:', classData);
    
    // Only update the selected class state
    setSelectedClass({
      id: classData.id,
      name: classData.name,
      code: classData.code,
      description: classData.description,
      grade: 0,
      specialty: classData.specialty || 'General'
    });

    toast({
      title: "Class Selected",
      description: `Selected ${classData.name} (${classData.code})`
    });

    // For AttendanceMarker role, auto-navigate to select subject
    if (effectiveRole === 'AttendanceMarker') {
      console.log('AttendanceMarker detected - auto-navigating to select subject');
      setTimeout(() => {
        window.history.pushState({}, '', '/select-subject');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 1000); // Small delay to show the toast
    }

    // Explicitly log that no further API calls should happen
    console.log('Class selection complete - blocking any follow-up requests');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log('Changing page from', currentPage, 'to', newPage);
      fetchClassesByRole(newPage, pageSize, false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    console.log('Changing page size from', pageSize, 'to', newPageSize);
    setPageSize(newPageSize);
    fetchClassesByRole(1, newPageSize, false);
  };

  const handleEnrollSubmit = async (values: z.infer<typeof enrollFormSchema>) => {
    setIsEnrolling(true);
    try {
      const enrollData: EnrollClassData = {
        classId: values.classId,
        enrollmentCode: values.enrollmentCode,
      };

      const result = await instituteClassesApi.enroll(enrollData);
      
      setEnrollDialogOpen(false);
      
      if (result.requiresVerification) {
        toast({
          title: "Enrollment Submitted",
          description: result.message || "Waiting for teacher verification.",
        });
      } else {
        toast({
          title: "Successfully Enrolled",
          description: result.message || "You have been enrolled in the class!",
        });
      }
      
      enrollForm.reset();
      fetchClassesByRole(currentPage, pageSize, true);
    } catch (error) {
      console.error('Enrollment error:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('code') || 
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('incorrect')) {
        toast({
          title: "Invalid Enrollment Code",
          description: "The enrollment code is invalid. Please try again.",
          variant: "destructive"
        });
      } else if (errorMessage.toLowerCase().includes('already enrolled')) {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this class.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Enrollment Success",
          description: "Please wait for verification.",
        });
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const tableColumns = [
    {
      key: 'imageUrl',
      header: 'Image',
      render: (value: any, row: ClassCardData) => (
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={value} 
            alt={row.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            <Image className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      )
    },
    {
      key: 'name',
      header: 'Class Name',
      render: (value: any, row: ClassCardData) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      key: 'specialty',
      header: 'Type',
      render: (value: any, row: ClassCardData) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-gray-500">{row.classType}</div>
        </div>
      )
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      render: (value: any) => <span className="text-sm">{value}</span>
    },
    {
      key: 'studentCount',
      header: 'Students',
      render: (value: any, row: ClassCardData) => `${value}/${row.capacity || 'N/A'}`
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: any) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const customActions = [
    {
      label: 'Select',
      action: (classData: ClassCardData) => handleSelectClass(classData),
      icon: <School className="h-3 w-3" />,
      variant: 'default' as const
    }
  ];

  const handleOpenEnrollDialog = () => {
    enrollForm.reset({
      classId: '',
      enrollmentCode: '',
    });
    setEnrollDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view classes.</p>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-600 dark:text-gray-400">Please select an institute first.</p>
      </div>
    );
  }

  const handleRefreshClick = () => {
    console.log('Manual refresh requested');
    fetchClassesByRole(currentPage, pageSize, true);
  };

  const handleLoadDataClick = () => {
    console.log('Manual load requested');
    fetchClassesByRole(1, pageSize, false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Select Class
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Choose a class to manage lectures and attendance
          </p>
          {selectedInstitute && (
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-2">
              Institute: {selectedInstitute.name}
            </p>
          )}
          {effectiveRole === 'Student' && (
            <Button
              onClick={handleOpenEnrollDialog}
              variant="default"
              size="sm"
              className="mt-3 w-full sm:w-auto"
            >
              <School className="h-4 w-4 mr-2" />
              Enroll Class
            </Button>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            onClick={handleRefreshClick}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
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

      {/* Filters */}
      {dataLoaded && showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {Array.from({ length: 13 }, (_, i) => i).map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classType">Class Type</Label>
                <Select value={classTypeFilter} onValueChange={setClassTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="remedial">Remedial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredClasses.length} of {classesData.length} classes
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setGradeFilter('all');
                  setSpecialtyFilter('all');
                  setClassTypeFilter('all');
                  setAcademicYearFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!dataLoaded ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            Click the load button to view your enrolled classes
          </p>
          <Button 
            onClick={handleLoadDataClick}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Classes...
              </>
            ) : (
              <>
                <School className="h-4 w-4 mr-2" />
                Load My Classes
              </>
            )}
          </Button>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {searchTerm || gradeFilter !== 'all' || specialtyFilter !== 'all' || classTypeFilter !== 'all' || academicYearFilter !== 'all' || statusFilter !== 'all'
              ? 'No classes match your current filters.'
              : 'No enrolled classes found.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View Content - Fancy Gradient Cards */}
          <div className="md:hidden">
            <div className="grid grid-cols-1 gap-6 p-4">
              {filteredClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="relative flex w-full flex-col rounded-xl bg-gradient-to-br from-white to-gray-50 bg-clip-border text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleSelectClass(classItem)}
                >
                  <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-clip-border shadow-lg group">
                    {classItem.imageUrl ? (
                      <img 
                        src={classItem.imageUrl} 
                        alt={classItem.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-90"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <School className="w-20 h-20 text-white/90 transform transition-transform group-hover:scale-110 duration-300" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-6">
                    <h5 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-gray-900 antialiased group-hover:text-blue-600 transition-colors duration-300">
                      {classItem.name}
                    </h5>
                    <p className="block font-sans text-base font-light leading-relaxed text-gray-700 antialiased mb-4">
                      {classItem.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Code:</span>
                        <Badge variant="outline">{classItem.code}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Academic Year:</span>
                        <span>{classItem.academicYear}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Type:</span>
                        <span>{classItem.specialty}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Students:</span>
                        <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
                          {classItem.studentCount}/{classItem.capacity || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button className="group relative w-full inline-flex items-center justify-center px-6 py-3 font-bold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5">
                      <span className="relative flex items-center gap-2">
                        Select Class
                        <svg
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          fill="none"
                          className="w-5 h-5 transform transition-transform group-hover:translate-x-1"
                        >
                          <path
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 p-2 md:p-3 lg:p-4">
              {filteredClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="relative flex w-full flex-col rounded-xl bg-gradient-to-br from-white to-gray-50 bg-clip-border text-gray-700 shadow-md md:shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleSelectClass(classItem)}
                >
                  <div className="relative mx-3 md:mx-4 -mt-4 md:-mt-6 h-28 md:h-32 lg:h-40 overflow-hidden rounded-xl bg-clip-border shadow-md md:shadow-lg group">
                    {classItem.imageUrl ? (
                      <img 
                        src={classItem.imageUrl} 
                        alt={classItem.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-90"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <School className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-white/90 transform transition-transform group-hover:scale-110 duration-300" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-3 md:p-4 lg:p-6">
                    <h5 className="mb-1 md:mb-2 block font-sans text-base md:text-lg lg:text-xl font-semibold leading-snug tracking-normal text-gray-900 antialiased group-hover:text-blue-600 transition-colors duration-300">
                      {classItem.name}
                    </h5>
                    <p className="block font-sans text-xs md:text-sm lg:text-base font-light leading-relaxed text-gray-700 antialiased mb-2 md:mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                    <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Code:</span>
                        <Badge variant="outline" className="text-xs">{classItem.code}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">Academic Year:</span>
                        <span className="truncate">{classItem.academicYear}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Type:</span>
                        <span className="truncate">{classItem.specialty}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 md:p-4 lg:p-6 pt-0">
                    <button className="group relative w-full inline-flex items-center justify-center px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3 text-sm md:text-base font-bold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md md:shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5">
                      <span className="relative flex items-center gap-1 md:gap-2">
                        Select Class
                        <svg
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          fill="none"
                          className="w-4 h-4 md:w-5 md:h-5 transform transition-transform group-hover:translate-x-1"
                        >
                          <path
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1 || isLoading}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages || isLoading}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} classes
            </div>
          </div>
        </>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll in Class</DialogTitle>
            <DialogDescription>
              Enter the class ID and enrollment code to join a class.
            </DialogDescription>
          </DialogHeader>

          <Form {...enrollForm}>
            <form onSubmit={enrollForm.handleSubmit(handleEnrollSubmit)} className="space-y-4">
              <FormField
                control={enrollForm.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter class ID" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={enrollForm.control}
                name="enrollmentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter enrollment code" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEnrollDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isEnrolling}>
                  {isEnrolling ? 'Enrolling...' : 'Enroll'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassSelector;
