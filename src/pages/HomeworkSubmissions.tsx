import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { homeworkSubmissionsApi, type HomeworkSubmission } from '@/api/homeworkSubmissions.api';
import { AccessControl, UserRole } from '@/utils/permissions';
import { FileText, Calendar, User, ExternalLink, RefreshCw, ArrowLeft, BookOpen, School, Users, Lock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const HomeworkSubmissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadSubmissions = async () => {
    if (!currentInstituteId || !currentClassId || !currentSubjectId) {
      toast({
        title: "Missing Selection",
        description: "Please select institute, class, and subject to view submissions.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get all submissions for the selected institute/class/subject context
      const response = await homeworkSubmissionsApi.getSubmissions({
        page: 1,
        limit: 100,
        sortBy: 'submissionDate',
        sortOrder: 'DESC'
      }, true);

      const submissionsList = Array.isArray(response) ? response : response.data || [];
      
      // Since we don't have direct filtering by institute/class/subject in the API,
      // we'll show all submissions the user has access to
      setSubmissions(submissionsList);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load homework submissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentInstituteId && currentClassId && currentSubjectId) {
      loadSubmissions();
    }
  }, [currentInstituteId, currentClassId, currentSubjectId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGoBack = () => {
    navigate('/homework');
  };

  const getContextTitle = () => {
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
    
    return contexts.join(' → ');
  };

  // Check if user has permission to view homework submissions
  if (!user?.role || !AccessControl.hasPermission(user.role as UserRole, 'view-homework-submissions')) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-4">
                You don't have permission to view homework submissions. Only teachers and institute administrators can access this feature.
              </p>
              <Button onClick={() => navigate('/homework')}>
                Back to Homework
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homework
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              Homework Submissions
            </h1>
            <p className="text-muted-foreground mt-1">
              {getContextTitle() && `${getContextTitle()} • `}View and manage all homework submissions
            </p>
            {lastRefresh && (
              <p className="text-sm text-muted-foreground mt-1">
                Last refreshed: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Context Info Card */}
        {selectedInstitute && selectedClass && selectedSubject && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Current Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Institute</p>
                    <p className="font-medium">{selectedInstitute.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="font-medium">{selectedClass.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{selectedSubject.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            All Submissions ({submissions.length})
          </h2>
          <Button
            variant="outline"
            onClick={loadSubmissions}
            disabled={isLoading}
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

        {/* Check for missing context */}
        {(!currentInstituteId || !currentClassId || !currentSubjectId) ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Missing Context</h3>
              <p className="text-muted-foreground mb-4">
                Please select institute, class, and subject to view homework submissions.
              </p>
              <Button onClick={() => navigate('/homework')}>
                Go to Homework
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Submissions Found</h3>
              <p className="text-muted-foreground">No homework submissions found for the selected context.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Homework Title */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Homework</h4>
                      <h3 className="font-semibold">{submission.homework?.title || 'Unknown Homework'}</h3>
                      {submission.homework?.description && (
                        <p className="text-sm text-muted-foreground mt-1">{submission.homework.description}</p>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {submission.student?.firstName} {submission.student?.lastName}
                          </span>
                          <Badge variant={submission.isActive ? 'default' : 'secondary'}>
                            {submission.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Submitted: {formatDate(submission.submissionDate)}
                        </div>
                      </div>
                    </div>

                    {/* Student Notes */}
                    {submission.remarks && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Student Notes:</h4>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {submission.remarks}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    <div className="flex gap-4">
                      {submission.fileUrl && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Submitted File:</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(submission.fileUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View File
                          </Button>
                        </div>
                      )}

                      {submission.teacherCorrectionFileUrl && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Teacher Correction:</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(submission.teacherCorrectionFileUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View Correction
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created: {formatDate(submission.createdAt)}
                      {submission.updatedAt !== submission.createdAt && (
                        <> • Updated: {formatDate(submission.updatedAt)}</>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HomeworkSubmissions;