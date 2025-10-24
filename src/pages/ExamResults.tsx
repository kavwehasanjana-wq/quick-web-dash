import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Award, RefreshCw, AlertTriangle, TrendingUp, BookOpen, Calendar, Target, Download, Filter, ArrowLeft, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { examResultsApi, type ExamResult, type ExamResultsQueryParams } from '@/api/examResults.api';
import { useApiRequest } from '@/hooks/useApiRequest';
import AppLayout from '@/components/layout/AppLayout';
import MUITable from '@/components/ui/mui-table';
const ExamResults = () => {
  const navigate = useNavigate();
  const {
    examId
  } = useParams<{
    examId: string;
  }>();
  const [examDetails, setExamDetails] = useState<{
    title?: string;
    examType?: string;
    totalMarks?: string;
    passingMarks?: string;
  }>({});
  const {
    user,
    selectedInstitute,
    selectedClass,
    selectedSubject,
    currentInstituteId,
    currentClassId,
    currentSubjectId
  } = useAuth();
  const {
    toast
  } = useToast();
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const {
    execute: fetchResults,
    loading
  } = useApiRequest(examResultsApi.getExamResults);
  const loadExamResults = async (page = currentPage) => {
    if (!currentInstituteId || !currentClassId || !currentSubjectId) {
      toast({
        title: "Selection Required",
        description: "Please select institute, class, and subject to view exam results",
        variant: "destructive"
      });
      return;
    }
    try {
      const params: ExamResultsQueryParams = {
        page,
        limit: 10,
        instituteId: currentInstituteId,
        classId: currentClassId,
        subjectId: currentSubjectId
      };
      if (examId) {
        params.examId = examId;
      }
      const response = await fetchResults(params, true);
      setExamResults(response.data);
      setTotalResults(response.meta.total);
      setTotalPages(response.meta.totalPages);
      setHasNextPage(response.meta.hasNextPage);
      setHasPreviousPage(response.meta.hasPreviousPage);
      setCurrentPage(page);
      setLastRefresh(new Date());

      // Set exam details from first result
      if (response.data.length > 0 && !examDetails.title) {
        const firstResult = response.data[0];
        setExamDetails({
          title: firstResult.exam.title,
          examType: firstResult.exam.examType
        });
      }
      toast({
        title: "Results Loaded",
        description: `Loaded ${response.data.length} exam results`
      });
    } catch (error) {
      console.error('Error loading exam results:', error);
      toast({
        title: "Error",
        description: "Failed to load exam results",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    if (currentInstituteId && currentClassId && currentSubjectId && examId) {
      loadExamResults(1);
    }
  }, [currentInstituteId, currentClassId, currentSubjectId, examId]);
  const handlePageChange = (newPage: number) => {
    loadExamResults(newPage);
  };
  const handleGoBack = () => {
    navigate('/exams');
  };
  const getContextBreadcrumb = () => {
    const parts = [];
    if (selectedInstitute) parts.push(selectedInstitute.name);
    if (selectedClass) parts.push(selectedClass.name);
    if (selectedSubject) parts.push(selectedSubject.name);
    return parts.length > 0 ? `Exams (${parts.join(' → ')})` : 'Exams';
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'F':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  const calculateAverageScore = () => {
    if (examResults.length === 0) return 0;
    const totalScore = examResults.reduce((sum, result) => sum + parseFloat(result.score), 0);
    return Math.round(totalScore / examResults.length * 100) / 100;
  };
  const getGradeDistribution = () => {
    const distribution: Record<string, number> = {};
    examResults.forEach(result => {
      const grade = result.grade.toUpperCase();
      distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return distribution;
  };
  const gradeDistribution = getGradeDistribution();
  const averageScore = calculateAverageScore();

  // Filter results based on search term
  const filteredResults = examResults.filter(result => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return result.student.firstName.toLowerCase().includes(searchLower) || result.student.lastName.toLowerCase().includes(searchLower) || result.student.email.toLowerCase().includes(searchLower) || result.grade.toLowerCase().includes(searchLower) || result.remarks && result.remarks.toLowerCase().includes(searchLower);
  });
  return <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div className="flex-1">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="mb-2 -ml-2">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="text-sm sm:text-base truncate">{getContextBreadcrumb()}</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">
              Exam Results{examDetails.title ? `: ${examDetails.title}` : ''}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              View and analyze exam results
            </p>
            {lastRefresh && <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Last refreshed: {lastRefresh.toLocaleTimeString()}
              </p>}
          </div>
        </div>

        {/* Exam Info and Current Selection */}
        

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">
            All Results ({filteredResults.length})
          </h2>
          <Button variant="outline" onClick={() => loadExamResults(currentPage)} disabled={loading} size="sm" className="w-full sm:w-auto">
            {loading ? <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                <span className="text-sm">Loading...</span>
              </> : <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="text-sm">Refresh</span>
              </>}
          </Button>
        </div>

        {!currentInstituteId || !currentClassId || !currentSubjectId ? <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selection Required</h3>
              <p className="text-muted-foreground">
                Please select institute, class, and subject to view exam results.
              </p>
            </CardContent>
          </Card> : <>
          {/* Summary Cards */}
          {examResults.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Results</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalResults}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {averageScore}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A Grades</CardTitle>
                  <Award className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {(gradeDistribution.A || 0) + (gradeDistribution['A+'] || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {averageScore >= 85 ? 'Excellent' : averageScore >= 70 ? 'Good' : averageScore >= 50 ? 'Average' : 'Poor'}
                  </div>
                </CardContent>
              </Card>
            </div>}

          {/* Grade Distribution */}
          {examResults.length > 0 && Object.keys(gradeDistribution).length > 0 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(gradeDistribution).map(([grade, count]) => <div key={grade} className="flex items-center gap-2">
                      <Badge className={getGradeColor(grade)}>
                        Grade {grade}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} result{count !== 1 ? 's' : ''}
                      </span>
                    </div>)}
                </div>
              </CardContent>
            </Card>}

            {/* Results Table */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Student Results</span>
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {totalResults} total result{totalResults !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Search Bar */}
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                    <Input placeholder="Search students, grade, remarks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 sm:pl-10 text-sm" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading results...</span>
                  </div> : filteredResults.length > 0 ? <MUITable title="" columns={[{
              id: 'student',
              label: 'Student',
              minWidth: 180,
              format: (value: any, row: ExamResult) => <div className="flex flex-col">
                            <span className="font-medium">
                              {row.student.firstName} {row.student.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {row.student.email}
                            </span>
                          </div>
            }, {
              id: 'exam',
              label: 'Exam Details',
              minWidth: 150,
              format: (value: any, row: ExamResult) => <div className="flex flex-col">
                            <span className="font-medium">{row.exam.title}</span>
                            <Badge variant="outline" className="text-xs w-fit mt-1">
                              {row.exam.examType}
                            </Badge>
                          </div>
            }, {
              id: 'score',
              label: 'Score',
              minWidth: 120,
              align: 'center' as const,
              format: (value: string, row: ExamResult) => <div className="flex items-center gap-2 justify-center">
                            <span className="font-semibold text-lg">{value}</span>
                            {examDetails.totalMarks && <span className="text-muted-foreground">/ {examDetails.totalMarks}</span>}
                          </div>
            }, {
              id: 'grade',
              label: 'Grade',
              minWidth: 100,
              align: 'center' as const,
              format: (value: string) => <Badge className={getGradeColor(value)}>
                            {value}
                          </Badge>
            }, ...(examDetails.totalMarks && examDetails.passingMarks ? [{
              id: 'status',
              label: 'Pass/Fail',
              minWidth: 100,
              align: 'center' as const,
              format: (value: any, row: ExamResult) => <Badge variant={parseFloat(row.score) >= parseFloat(examDetails.passingMarks!) ? "default" : "destructive"}>
                            {parseFloat(row.score) >= parseFloat(examDetails.passingMarks!) ? "Pass" : "Fail"}
                          </Badge>
            }] : []), {
              id: 'createdAt',
              label: 'Date',
              minWidth: 120,
              format: (value: string) => <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(value)}
                          </div>
            }, {
              id: 'remarks',
              label: 'Remarks',
              minWidth: 150,
              format: (value: string) => <span className="text-sm">
                            {value || "No remarks"}
                          </span>
            }]} data={filteredResults} page={currentPage - 1} rowsPerPage={10} totalCount={totalResults} onPageChange={newPage => handlePageChange(newPage + 1)} onRowsPerPageChange={() => {}} rowsPerPageOptions={[10]} /> : <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm ? 'No results match your search' : 'No Exam Results'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'No exam results found for the selected context.'}
                    </p>
                  </div>}
              </CardContent>
            </Card>
          </>}
      </div>
    </AppLayout>;
};
export default ExamResults;