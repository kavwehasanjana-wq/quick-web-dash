
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Filter, Eye, EyeOff, Plus, ChevronDown } from 'lucide-react';
import { organizationApi, Course, OrganizationQueryParams } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import CreateCourseForm from './forms/CreateCourseForm';

interface OrganizationCoursesProps {
  organizationId?: string;
  onSelectCourse?: (course: Course) => void;
  organization?: any;
}

const OrganizationCourses = ({ organizationId, onSelectCourse, organization }: OrganizationCoursesProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publicFilter, setPublicFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const { user, selectedOrganization } = useAuth();

  // Debug logging
  console.log('OrganizationCourses props:', { organizationId, organization });
  console.log('OrganizationCourses selectedOrganization from context:', selectedOrganization);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const params: OrganizationQueryParams = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(publicFilter !== 'all' && { isPublic: publicFilter === 'public' })
      };

      let response;
      if (organizationId) {
        // Fetch courses for specific organization
        response = await organizationApi.getOrganizationCourses(organizationId, params);
      } else {
        // Fetch all courses globally
        response = await organizationApi.getCourses(params);
      }
      
      setCourses(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setShowCreateForm(true);
  };

  const handleCreateSuccess = (course: any) => {
    console.log('Course created successfully:', course);
    setShowCreateForm(false);
    fetchCourses(); // Refresh the list
    toast({
      title: "Success",
      description: "Course created successfully",
    });
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm, publicFilter, organizationId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPublicFilter('all');
    setCurrentPage(1);
  };

  if (showCreateForm) {
    return (
      <CreateCourseForm
        onSuccess={handleCreateSuccess}
        onCancel={handleCreateCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getHeaderInfo = () => {
    if (organizationId) {
      return {
        title: 'Organization Courses',
        description: 'Browse courses for this organization'
      };
    }
    return {
      title: 'All Organization Courses',
      description: 'Browse all courses across organizations'
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{headerInfo.title}</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {headerInfo.description}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Filter Button */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background border shadow-lg" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select value={publicFilter} onValueChange={setPublicFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => { setCurrentPage(1); fetchCourses(); }} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {((selectedOrganization?.userRole === 'ADMIN' || selectedOrganization?.userRole === 'PRESIDENT') || 
            (organization?.userRole === 'ADMIN' || organization?.userRole === 'PRESIDENT') ||
            (user?.role === 'OrganizationManager')) && (
            <Button onClick={handleCreateCourse} className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Course</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </div>


      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {courses.map((course) => (
          <Card key={course.causeId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Badge variant={course.isPublic ? "default" : "secondary"} className="w-fit">
                    {course.isPublic ? (
                      <><Eye className="h-3 w-3 mr-1" /> Public</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" /> Private</>
                    )}
                  </Badge>
                  
                  {!organizationId && (
                    <Badge variant="outline" className="text-xs w-fit">
                      Org: {course.organizationId}
                    </Badge>
                  )}
                </div>
                
                {onSelectCourse && (
                  <Button 
                    onClick={() => onSelectCourse(course)}
                    className="w-full"
                  >
                    Select Course
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600 order-first sm:order-none">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}

      {courses.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Courses Found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {searchTerm || publicFilter !== 'all'
                ? 'No courses match your current filters.'
                : 'No courses available at the moment.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationCourses;
