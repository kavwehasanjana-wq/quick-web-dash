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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cachedApiClient } from '@/api/cachedClient';

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
  enrolledAt: string;
  class: {
    id: string;
    name: string;
    code: string;
    grade: number;
    specialty: string;
    academicYear: string;
    classType: string;
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
  const [classesData, setClassesData] = useState<ClassCardData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
    console.log('Loading classes data for user role:', user?.role, { page, limit, forceRefresh, dataLoaded });
    
    try {
      const userRole = (user?.role || 'Student') as UserRole;
      let endpoint = '';
      let params: Record<string, any> = {};
      
      if (userRole === 'Student') {
        // Use the new student-specific endpoint
        endpoint = `/institute-classes/${currentInstituteId}/student/${user?.id}`;
        params = { 
          page: page, 
          limit: limit 
        };
      } else if (userRole === 'Teacher') {
        endpoint = `/institute-class-subjects/institute/${currentInstituteId}/teacher/${user?.id}`;
        params = { page, limit };
      } else if (userRole === 'InstituteAdmin' || userRole === 'AttendanceMarker') {
        endpoint = '/institute-classes';
        params = { instituteId: currentInstituteId, page, limit };
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
      processClassesData(result, userRole, page);
      
    } catch (error) {
      console.error('Failed to load classes:', error);
      
      // Fallback: try alternative endpoint for admin users (not for students)
      if ((user?.role === 'InstituteAdmin' || user?.role === 'AttendanceMarker') && !forceRefresh) {
        try {
          console.log('Trying alternative endpoint...');
          const fallbackEndpoint = '/classes';
          const fallbackParams = { instituteId: currentInstituteId, page, limit };
          
          const fallbackResult = await cachedApiClient.get(fallbackEndpoint, fallbackParams, { 
            forceRefresh,
            ttl: 60 
          });
          
          console.log('Fallback API response:', fallbackResult);
          processClassesData(fallbackResult, user?.role as UserRole, page);
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
        if (result.meta) {
          pagination.total = result.meta.total || result.data.length;
          pagination.totalPages = result.meta.totalPages || 1;
        }
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
        imageUrl: undefined,
        _count: {
          students: 0, // Not provided in student response
          subjects: 0  // Not provided in student response
        }
      }));
    } else if (userRole === 'Teacher') {
      let teacherClassSubjects: TeacherClassSubjectData[] = [];
      
      if (Array.isArray(result)) {
        teacherClassSubjects = result;
        pagination.total = result.length;
        pagination.totalPages = 1;
      } else if (result.data && Array.isArray(result.data)) {
        teacherClassSubjects = result.data;
        if (result.meta) {
          pagination.total = result.meta.total || result.data.length;
          pagination.totalPages = result.meta.totalPages || 1;
        }
      }

      const uniqueClasses = new Map<string, ClassData>();
      
      teacherClassSubjects.forEach((item: TeacherClassSubjectData) => {
        if (!uniqueClasses.has(item.classId)) {
          uniqueClasses.set(item.classId, {
            id: item.classId,
            name: item.class.name,
            code: item.class.code,
            description: `${item.class.name} - Teaching ${item.subject.name}`,
            specialty: 'Teacher Assignment',
            classType: 'Teaching',
            academicYear: 'Current',
            isActive: item.isActive,
            capacity: 0,
            classTeacherId: item.class.classTeacherId,
            imageUrl: undefined,
            _count: {
              students: 0,
              subjects: 1
            }
          });
        } else {
          const existingClass = uniqueClasses.get(item.classId)!;
          if (existingClass._count) {
            existingClass._count.subjects += 1;
          }
        }
      });

      classesArray = Array.from(uniqueClasses.values());
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
          {/* Mobile View Content - Always Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredClasses}
              columns={tableColumns}
              customActions={customActions}
              allowEdit={false}
              allowDelete={false}
            />
            
            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredClasses.map((classItem) => (
                <Card 
                  key={classItem.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-blue-500"
                  onClick={() => handleSelectClass(classItem)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-24 w-24">
                          <AvatarImage 
                            src={classItem.imageUrl} 
                            alt={classItem.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Image className="h-12 w-12" />
                          </AvatarFallback>
                        </Avatar>
                        <School className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                      <Badge 
                        variant={classItem.isActive ? "default" : "secondary"}
                        className={classItem.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {classItem.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{classItem.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Code: {classItem.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {classItem.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{classItem.studentCount}/{classItem.capacity || 'N/A'} Students</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{classItem.subjectCount} Subjects</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Academic Year: {classItem.academicYear}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2" />
                        <span>Type: {classItem.specialty}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                      Select Class
                    </Button>
                  </CardContent>
                </Card>
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
    </div>
  );
};

export default ClassSelector;
