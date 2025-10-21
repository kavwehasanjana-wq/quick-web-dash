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
import { useInstituteRole } from '@/hooks/useInstituteRole';
interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  creditHours?: number;
  isActive?: boolean;
  subjectType?: string;
  basketCategory?: string;
  instituteType?: string;
  imgUrl?: string;
  createdAt?: string;
  updatedAt?: string;
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
  category: string;
  creditHours: number;
  isActive: boolean;
  subjectType: string;
  basketCategory: string;
  instituteType: string;
  imgUrl?: string;
  createdAt: string;
  updatedAt: string;
}
const SubjectSelector = () => {
  const {
    user,
    selectedInstitute,
    selectedClass,
    setSelectedSubject,
    currentInstituteId,
    currentClassId
  } = useAuth();
  const instituteRole = useInstituteRole();
  const {
    toast
  } = useToast();
  const [subjectsData, setSubjectsData] = useState<SubjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    return token;
  };
  const getApiHeaders = () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };
  const fetchSubjectsByRole = async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    console.log('Loading subjects data for teacher');
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      let url: string;

      // For Institute Admin and AttendanceMarker, use the new class subjects API endpoint
      if (instituteRole === 'InstituteAdmin' || instituteRole === 'AttendanceMarker') {
        if (!currentInstituteId || !currentClassId) {
          throw new Error('Missing required parameters for institute admin/attendance marker subject fetch');
        }
        url = `${baseUrl}/institutes/${currentInstituteId}/classes/${currentClassId}/subjects?page=${page}&limit=${limit}`;
      } else if (instituteRole === 'Teacher') {
        if (!currentInstituteId || !currentClassId || !user.id) {
          throw new Error('Missing required parameters for teacher subject fetch');
        }
        url = `${baseUrl}/institutes/${currentInstituteId}/classes/${currentClassId}/subjects/teacher/${user.id}?page=${page}&limit=${limit}`;
      } else if (instituteRole === 'Student') {
        if (!currentInstituteId || !currentClassId || !user.id) {
          throw new Error('Missing required parameters for student subject fetch');
        }
        url = `${baseUrl}/institute-class-subject-students/${currentInstituteId}/student-subjects/class/${currentClassId}/student/${user.id}?page=${page}&limit=${limit}`;
      } else {
        // For other roles, use the original subjects endpoint
        url = `${baseUrl}/subjects`;
      }
      console.log('Fetching from URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects data: ${response.status}`);
      }
      const result = await response.json();
      console.log('Raw API response:', result);
      let subjects: SubjectCardData[] = [];
      if (instituteRole === 'InstituteAdmin' || instituteRole === 'Teacher' || instituteRole === 'AttendanceMarker') {
        // Handle the new API response format for Institute Admin and Teacher
        if (Array.isArray(result)) {
          // Direct array response
          subjects = result.map((item: any) => ({
            id: item.subject.id,
            name: item.subject.name,
            code: item.subject.code,
            description: item.subject.description || '',
            category: item.subject.category || '',
            creditHours: item.subject.creditHours || 0,
            isActive: item.subject.isActive,
            subjectType: item.subject.subjectType || '',
            basketCategory: item.subject.basketCategory || '',
            instituteType: item.subject.instituteType || '',
            imgUrl: item.subject.imgUrl,
            createdAt: item.subject.createdAt,
            updatedAt: item.subject.updatedAt
          }));
        } else if (result.data && Array.isArray(result.data)) {
          subjects = result.data.map((item: any) => ({
            id: item.subject.id,
            name: item.subject.name,
            code: item.subject.code,
            description: item.subject.description || '',
            category: item.subject.category || '',
            creditHours: item.subject.creditHours || 0,
            isActive: item.subject.isActive,
            subjectType: item.subject.subjectType || '',
            basketCategory: item.subject.basketCategory || '',
            instituteType: item.subject.instituteType || '',
            imgUrl: item.subject.imgUrl,
            createdAt: item.subject.createdAt,
            updatedAt: item.subject.updatedAt
          }));
        }

        // For Institute Admin, Teacher, and AttendanceMarker, use the pagination data from the API response
        const totalSubjects = result.total || subjects.length;
        const totalPagesFromApi = result.totalPages || Math.ceil(totalSubjects / limit);
        setSubjectsData(subjects);
        setTotalItems(totalSubjects);
        setTotalPages(totalPagesFromApi);
        setCurrentPage(result.page || page);
      } else if (instituteRole === 'Student') {
        // Handle the new API response format for students
        if (result.data && Array.isArray(result.data)) {
          subjects = result.data.map((item: any) => ({
            id: item.subject.id,
            name: item.subject.name,
            code: item.subject.code,
            description: item.subject.description || '',
            category: item.subject.category || '',
            creditHours: item.subject.creditHours || 0,
            isActive: item.subject.isActive,
            subjectType: item.subject.subjectType || '',
            basketCategory: item.subject.basketCategory || '',
            instituteType: item.subject.instituteType || '',
            imgUrl: item.subject.imgUrl,
            createdAt: item.subject.createdAt,
            updatedAt: item.subject.updatedAt
          }));
        }

        // For students, use the pagination data from the API response
        const totalSubjects = result.total || 0;
        const totalPages = Math.ceil(totalSubjects / limit);
        setSubjectsData(subjects);
        setTotalItems(totalSubjects);
        setTotalPages(totalPages);
        setCurrentPage(page);
      } else {
        // Handle the original response for other roles
        if (Array.isArray(result)) {
          subjects = result;
        } else if (result.data && Array.isArray(result.data)) {
          subjects = result.data;
        }

        // Apply pagination for other roles
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSubjects = subjects.slice(startIndex, endIndex);
        const totalSubjects = subjects.length;
        const totalPages = Math.ceil(totalSubjects / limit);
        setSubjectsData(paginatedSubjects);
        setTotalItems(totalSubjects);
        setTotalPages(totalPages);
        setCurrentPage(page);
      }
      setDataLoaded(true);
      toast({
        title: "Subjects Loaded",
        description: `Successfully loaded ${subjects.length} subjects.`
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

  // REMOVED: Auto-loading useEffect that caused unnecessary API calls
  // Data now only loads when user explicitly clicks load button
  const handleSelectSubject = (subject: SubjectCardData) => {
    console.log('Selecting subject:', subject);
    setSelectedSubject({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description,
      category: subject.category,
      creditHours: subject.creditHours,
      isActive: subject.isActive,
      subjectType: subject.subjectType,
      basketCategory: subject.basketCategory,
      instituteType: subject.instituteType,
      imgUrl: subject.imgUrl
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
  if (!user) {
    return <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view subjects.</p>
      </div>;
  }
  if (!currentInstituteId) {
    return <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please select an institute first.</p>
      </div>;
  }
  if ((['Student','InstituteAdmin','Teacher','AttendanceMarker'].includes(instituteRole)) && !currentClassId) {
    return <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please select a class first.</p>
      </div>;
  }
  return <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Select Subject
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Choose a subject to manage lectures and attendance
          </p>
          {selectedInstitute && <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-2">
              Institute: {selectedInstitute.name}
            </p>}
          {selectedClass && <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
              Class: {selectedClass.name}
            </p>}
        </div>
        <Button onClick={() => fetchSubjectsByRole(currentPage, pageSize)} disabled={isLoading} variant="outline" size="sm" className="w-full sm:w-auto">
          {isLoading ? <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Loading...</span>
            </> : <>
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </>}
        </Button>
      </div>

      {!dataLoaded ? <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load your subjects
          </p>
          <Button onClick={() => fetchSubjectsByRole(1, pageSize)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Subjects...
              </> : <>
                <BookOpen className="h-4 w-4 mr-2" />
                Load My Subjects
              </>}
          </Button>
        </div> : <div className="max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 p-2 md:p-3 lg:p-4">
            {subjectsData.map(subject => <div key={subject.id} className="relative flex w-full flex-col rounded-xl bg-gradient-to-br from-white to-gray-50 bg-clip-border text-gray-700 shadow-md md:shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => handleSelectSubject(subject)}>
                <div className="relative mx-3 md:mx-4 -mt-4 md:-mt-6 h-28 md:h-32 lg:h-40 overflow-hidden rounded-xl bg-clip-border shadow-md md:shadow-lg group">
                  {subject.imgUrl ? <img src={subject.imgUrl} alt={subject.name} className="w-full h-full object-cover" /> : <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-90"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-white/90 transform transition-transform group-hover:scale-110 duration-300" />
                      </div>
                    </>}
                </div>
                <div className="p-3 md:p-4 lg:p-6">
                  <h5 className="mb-1 md:mb-2 block font-sans text-base md:text-lg lg:text-xl font-semibold leading-snug tracking-normal text-gray-900 antialiased group-hover:text-blue-600 transition-colors duration-300">
                    {subject.name}
                  </h5>
                  <p className="block font-sans text-xs md:text-sm lg:text-base font-light leading-relaxed text-gray-700 antialiased mb-1 md:mb-2 line-clamp-2">
                    {subject.description}
                  </p>
                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                    <span className="truncate">Code: {subject.code}</span>
                    <Badge variant={subject.category === 'Core' ? 'default' : 'secondary'} className="text-xs">
                      {subject.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                    <span className="truncate">Credits: {subject.creditHours}</span>
                    <span className="truncate">{subject.subjectType}</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 lg:p-6 pt-0">
                  <button className="group relative w-full inline-flex items-center justify-center px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3 text-sm md:text-base font-bold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md md:shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5">
                    <span className="relative flex items-center gap-1 md:gap-2">
                      Select Subject
                      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-4 h-4 md:w-5 md:h-5 transform transition-transform group-hover:translate-x-1">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></path>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && <div className="flex justify-center items-center gap-4 mt-6 pb-4">
              <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>}
        </div>}
    </div>;
};
export default SubjectSelector;