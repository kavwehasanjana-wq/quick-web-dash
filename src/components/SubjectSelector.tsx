import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataCardView } from '@/components/ui/data-card-view';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { BookOpen, Clock, CheckCircle, RefreshCw, User, School, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { instituteApi } from '@/api/institute.api';
import { useApiRequest } from '@/hooks/useApiRequest';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
}

interface StudentSubjectData {
  instituteId: string;
  classId: string;
  subjectId: string;
  subject: Subject;
}

interface ClassSubjectData {
  instituteId: string;
  classId: string;
  subjectId: string;
  teacherId?: string;
  subject: Subject;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubjectCardData {
  id: string;
  name: string;
  code: string;
  description: string;
  className: string;
  classCode: string;
  teacherName?: string;
  isMandatory: boolean;
}

const SubjectSelector = () => {
  const { user, selectedInstitute, selectedClass, setSelectedSubject, currentInstituteId, currentClassId } = useAuth();
  const { toast } = useToast();
  const [subjectsData, setSubjectsData] = useState<SubjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    return token;
  };

  const getApiHeaders = () => {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const fetchSubjectsByRole = async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    console.log('Loading subjects data for user role:', user?.role, { page, limit });
    
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      let url = '';
      let classSubjects: any[] = [];
      let pagination = { total: 0, totalPages: 1 };
      
      const userRole = (user?.role || 'Student') as UserRole;
      
      if (userRole === 'Student' && currentInstituteId && currentClassId) {
        // Use the student-specific endpoint
        url = `${baseUrl}/institute-class-subject-students/${currentInstituteId}/student-subjects/class/${currentClassId}/student/${user?.id}?page=${page}&limit=${limit}`;
        
        console.log('Fetching from Student URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch subjects data: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw Student API response:', result);
        
        // Handle student response structure
        if (result.data && Array.isArray(result.data)) {
          classSubjects = result.data;
          pagination.total = result.total || result.data.length;
          pagination.totalPages = Math.ceil(pagination.total / limit);
        } else if (Array.isArray(result)) {
          classSubjects = result;
          pagination.total = result.length;
          pagination.totalPages = 1;
        }

        // Transform student subject data
        const transformedSubjects = classSubjects.map((item: StudentSubjectData): SubjectCardData => ({
          id: item.subject.id,
          name: item.subject.name,
          code: item.subject.code,
          description: item.subject.description || `${item.subject.category || 'General'} Subject`,
          className: selectedClass?.name || 'Current Class',
          classCode: selectedClass?.code || '',
          teacherName: 'Not available',
          isMandatory: item.subject.category === 'Core'
        }));

        setSubjectsData(transformedSubjects);
        setTotalItems(pagination.total);
        setTotalPages(pagination.totalPages);
        setCurrentPage(page);
        setDataLoaded(true);

      } else if (userRole === 'InstituteAdmin' && currentInstituteId) {
        // For InstituteAdmin: use the general institute subjects endpoint (no class filtering in URL)
        url = `${baseUrl}/institute-class-subjects/institute/${currentInstituteId}`;
        
        console.log('Fetching from InstituteAdmin URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch subjects data: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw InstituteAdmin API response:', result);
        
        // Handle the response structure
        if (Array.isArray(result)) {
          classSubjects = result;
        } else if (result.data && Array.isArray(result.data)) {
          classSubjects = result.data;
        }

        // Filter by selected class if one is selected
        if (currentClassId && classSubjects.length > 0) {
          classSubjects = classSubjects.filter((item: any) => item.classId === currentClassId);
        }

        // Apply pagination manually since API doesn't support it
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSubjects = classSubjects.slice(startIndex, endIndex);
        
        pagination.total = classSubjects.length;
        pagination.totalPages = Math.ceil(pagination.total / limit);

        // Transform the data to subject cards
        const transformedSubjects = await transformToSubjectCards(paginatedSubjects, userRole);
        
        console.log('Transformed subjects:', transformedSubjects);
        setSubjectsData(transformedSubjects);
        setTotalItems(pagination.total);
        setTotalPages(pagination.totalPages);
        setCurrentPage(page);
        setDataLoaded(true);

      } else if (userRole === 'Teacher') {
        // For teachers: get subjects they teach
        url = `${baseUrl}/institute-class-subjects/teacher/${user?.id}`;
        
        console.log('Fetching from Teacher URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch subjects data: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw Teacher API response:', result);
        
        if (Array.isArray(result)) {
          classSubjects = result;
        } else if (result.data && Array.isArray(result.data)) {
          classSubjects = result.data;
        }

        // Apply pagination manually
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSubjects = classSubjects.slice(startIndex, endIndex);
        
        pagination.total = classSubjects.length;
        pagination.totalPages = Math.ceil(pagination.total / limit);

        // Transform the data to subject cards
        const transformedSubjects = await transformToSubjectCards(paginatedSubjects, userRole);
        
        setSubjectsData(transformedSubjects);
        setTotalItems(pagination.total);
        setTotalPages(pagination.totalPages);
        setCurrentPage(page);
        setDataLoaded(true);

      } else {
        throw new Error('Please select an institute and class first');
      }
      
      toast({
        title: "Subjects Loaded",
        description: `Successfully loaded ${subjectsData.length} subjects.`
      });
      
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast({
        title: "Load Failed",
        description: error instanceof Error ? error.message : "Failed to load subjects data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transformToSubjectCards = async (classSubjects: ClassSubjectData[], userRole: UserRole): Promise<SubjectCardData[]> => {
    const subjectCards: SubjectCardData[] = [];
    const baseUrl = getBaseUrl();
    const headers = getApiHeaders();

    for (const item of classSubjects) {
      let subjectInfo = item.subject;
      
      // If subject info is not in the response or incomplete, fetch it
      if (!subjectInfo && item.subjectId) {
        try {
          const subjectResponse = await fetch(`${baseUrl}/subjects/${item.subjectId}`, {
            method: 'GET',
            headers
          });
          
          if (subjectResponse.ok) {
            const subjectData = await subjectResponse.json();
            subjectInfo = subjectData.data || subjectData;
          }
        } catch (error) {
          console.error('Error fetching subject details:', error);
        }
      }

      if (subjectInfo) {
        let className = 'Unknown Class';
        let classCode = '';
        
        // Use selected class info if available, otherwise try to fetch
        if (selectedClass && item.classId === selectedClass.id) {
          className = selectedClass.name;
          classCode = selectedClass.code;
        } else if (item.classId) {
          try {
            const classResponse = await fetch(`${baseUrl}/classes/${item.classId}`, {
              method: 'GET',
              headers
            });
            
            if (classResponse.ok) {
              const classData = await classResponse.json();
              const classInfo = classData.data || classData;
              className = classInfo.name || 'Unknown Class';
              classCode = classInfo.code || '';
            }
          } catch (error) {
            console.error('Error fetching class details:', error);
          }
        }

        const teacherName = item.teacherId ? `Teacher ID: ${item.teacherId}` : 'Not assigned';

        subjectCards.push({
          id: item.subjectId || subjectInfo.id,
          name: subjectInfo.name,
          code: subjectInfo.code,
          description: subjectInfo.description || `${className} Subject`,
          className: className,
          classCode: classCode,
          teacherName: teacherName,
          isMandatory: true
        });
      }
    }

    // Remove duplicates based on subject ID
    const uniqueSubjects = subjectCards.filter((subject, index, self) => 
      index === self.findIndex(s => s.id === subject.id)
    );

    return uniqueSubjects;
  };

  const handleSelectSubject = (subject: SubjectCardData) => {
    console.log('Selecting subject:', subject);
    
    setSelectedSubject({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description
    });

    toast({
      title: "Subject Selected",
      description: `Selected ${subject.name} (${subject.code})`
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log('Changing page from', currentPage, 'to', newPage);
      fetchSubjectsByRole(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    console.log('Changing page size from', pageSize, 'to', newPageSize);
    setPageSize(newPageSize);
    fetchSubjectsByRole(1, newPageSize);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Subject Name',
      render: (value: any, row: SubjectCardData) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      key: 'className',
      header: 'Class',
      render: (value: any, row: SubjectCardData) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-gray-500">{row.classCode}</div>
        </div>
      )
    },
    {
      key: 'teacherName',
      header: 'Teacher',
      render: (value: any) => <span className="text-sm">{value || 'Not assigned'}</span>
    },
    {
      key: 'isMandatory',
      header: 'Type',
      render: (value: any) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Mandatory' : 'Elective'}
        </Badge>
      )
    }
  ];

  const customActions = [
    {
      label: 'Select',
      action: (subject: SubjectCardData) => handleSelectSubject(subject),
      icon: <BookOpen className="h-3 w-3" />,
      variant: 'default' as const
    }
  ];

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view subjects.</p>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please select an institute first.</p>
      </div>
    );
  }

  if (user.role === 'Student' && !currentClassId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please select a class first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Select Subject
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a subject to manage lectures and attendance
          </p>
          {selectedInstitute && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Institute: {selectedInstitute.name}
            </p>
          )}
          {selectedClass && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Class: {selectedClass.name}
            </p>
          )}
        </div>
        <Button 
          onClick={() => fetchSubjectsByRole(currentPage, pageSize)} 
          disabled={isLoading}
          variant="outline"
          size="sm"
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

      {!dataLoaded ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load your subjects
          </p>
          <Button 
            onClick={() => fetchSubjectsByRole(1, pageSize)} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Subjects...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Load My Subjects
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile View Content - Always Card View */}
          <div className="md:hidden">
            <DataCardView
              data={subjectsData}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectsData.map((subject) => (
                <Card 
                  key={subject.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-blue-500"
                  onClick={() => handleSelectSubject(subject)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <Badge 
                        variant={subject.isMandatory ? "default" : "secondary"}
                        className={subject.isMandatory ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}
                      >
                        {subject.isMandatory ? "Mandatory" : "Elective"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{subject.name}</CardTitle>
                    <CardDescription>
                      Code: {subject.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {subject.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <School className="h-4 w-4 mr-2" />
                        <span>{subject.className} ({subject.classCode})</span>
                      </div>
                      {subject.teacherName && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <User className="h-4 w-4 mr-2" />
                          <span>Teacher: {subject.teacherName}</span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Select Subject
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} subjects
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubjectSelector;
