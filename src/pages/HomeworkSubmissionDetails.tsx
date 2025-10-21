import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AccessControl, UserRole } from '@/utils/permissions';
import { homeworkSubmissionsApi, type HomeworkSubmission } from '@/api/homeworkSubmissions.api';
import { homeworkApi, type Homework } from '@/api/homework.api';
import { FileText, Calendar, User, ExternalLink, RefreshCw, ArrowLeft, Lock, Edit } from 'lucide-react';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import AppLayout from '@/components/layout/AppLayout';
import UploadCorrectionDialog from '@/components/forms/UploadCorrectionDialog';

const HomeworkSubmissionDetails = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const instituteRole = useInstituteRole();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHomework, setIsLoadingHomework] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);

  const loadHomework = async () => {
    if (!homeworkId) return;

    setIsLoadingHomework(true);
    try {
      const response = await homeworkApi.getHomeworkById(homeworkId);
      setHomework(response);
    } catch (error) {
      console.error('Error loading homework:', error);
      toast({
        title: "Error",
        description: "Failed to load homework details",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHomework(false);
    }
  };

  const loadSubmissions = async () => {
    if (!homeworkId) return;

    setIsLoading(true);
    try {
      const response = await homeworkSubmissionsApi.getSubmissions({
        homeworkId: homeworkId,
        page: 1,
        limit: 50,
      }, true);

      const submissionsList = Array.isArray(response) ? response : response.data || [];
      setSubmissions(submissionsList);
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
    if (homeworkId) {
      loadHomework();
      loadSubmissions();
    }
  }, [homeworkId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCorrectionClick = (submission: HomeworkSubmission) => {
    setSelectedSubmission(submission);
    setCorrectionDialogOpen(true);
  };

  const handleCorrectionSuccess = () => {
    loadSubmissions(); // Refresh submissions to show the new correction file
  };

  // Check if user can upload corrections (InstituteAdmin or Teacher only)
  const canUploadCorrections = ['InstituteAdmin', 'Teacher'].includes(instituteRole);

  // Check if user has permission to view homework submissions (institute-specific)
  if (!AccessControl.hasPermission(instituteRole as UserRole, 'view-homework-submissions')) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
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

  if (isLoadingHomework) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading homework details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!homework) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Homework Not Found</h3>
              <p className="text-muted-foreground mb-4">The homework assignment could not be found.</p>
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
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/homework')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homework
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Homework Submissions</h1>
          </div>
        </div>

        {/* Homework Info */}
        <Card>
          <CardHeader>
            <CardTitle>{homework.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{homework.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {homework.startDate && (
                <span>Start: {new Date(homework.startDate).toLocaleDateString()}</span>
              )}
              {homework.endDate && (
                <span>Due: {new Date(homework.endDate).toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submissions Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Submissions ({submissions.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
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
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
                <p className="text-muted-foreground">No students have submitted this homework yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
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
                        {canUploadCorrections && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCorrectionClick(submission)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Correction
                          </Button>
                        )}
                      </div>

                      {submission.remarks && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Student Notes:</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            {submission.remarks}
                          </p>
                        </div>
                      )}

                      {submission.fileUrl && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Submitted File:</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(submission.fileUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
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
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Correction
                          </Button>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Created: {formatDate(submission.createdAt)}
                        {submission.updatedAt !== submission.createdAt && (
                          <> • Updated: {formatDate(submission.updatedAt)}</>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Correction Upload Dialog */}
        {selectedSubmission && (
          <UploadCorrectionDialog
            submissionId={selectedSubmission.id}
            studentName={`${selectedSubmission.student?.firstName} ${selectedSubmission.student?.lastName}`}
            isOpen={correctionDialogOpen}
            onClose={() => setCorrectionDialogOpen(false)}
            onSuccess={handleCorrectionSuccess}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default HomeworkSubmissionDetails;