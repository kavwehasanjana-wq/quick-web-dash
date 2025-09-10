
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowLeft, Download, Search, BookOpen, Eye, CheckCircle, Clock, FileText, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { subjectPaymentsApi, SubjectPayment, SubjectPaymentsResponse } from '@/api/subjectPayments.api';
import { institutePaymentsApi, PaymentSubmission } from '@/api/institutePayments.api';
import VerifySubmissionDialog from '@/components/forms/VerifySubmissionDialog';
import StudentSubmissionsDialog from '@/components/StudentSubmissionsDialog';
import CreateSubjectPaymentForm from '@/components/forms/CreateSubjectPaymentForm';
import SubmitSubjectPaymentDialog from '@/components/forms/SubmitSubjectPaymentDialog';


const SubjectPayments = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjectPaymentsData, setSubjectPaymentsData] = useState<SubjectPaymentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [createPaymentDialogOpen, setCreatePaymentDialogOpen] = useState(false);
  const [submitPaymentDialogOpen, setSubmitPaymentDialogOpen] = useState(false);
  const [selectedPaymentForSubmission, setSelectedPaymentForSubmission] = useState<SubjectPayment | null>(null);

  // Load subject payments based on user role
  const loadSubjectPayments = async () => {
    if (!selectedInstitute || !selectedClass || !selectedSubject) {
      toast({
        title: "Missing Selection",
        description: "Please select institute, class, and subject first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let response: SubjectPaymentsResponse;
      
      if (user?.role === 'Student') {
        // For students, use my-payments endpoint
        response = await subjectPaymentsApi.getMySubjectPayments(
          selectedInstitute.id, 
          selectedClass.id, 
          selectedSubject.id
        );
      } else if (user?.role === 'InstituteAdmin' || user?.role === 'Teacher') {
        // For admins and teachers, use regular endpoint
        response = await subjectPaymentsApi.getSubjectPayments(
          selectedInstitute.id, 
          selectedClass.id, 
          selectedSubject.id
        );
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view subject payments.",
          variant: "destructive"
        });
        return;
      }

      setSubjectPaymentsData(response);
      toast({
        title: "Success",
        description: "Subject payments loaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load subject payments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle verification for admins
  const handleVerify = (submission: PaymentSubmission) => {
    if (user?.role !== 'InstituteAdmin') {
      toast({
        title: "Access Denied",
        description: "Only Institute Admins can verify submissions.",
        variant: "destructive"
      });
      return;
    }
    setSelectedSubmission(submission);
    setVerifyDialogOpen(true);
  };

  // View submissions for a payment (admins/teachers only)
  const viewSubmissions = (payment: SubjectPayment) => {
    if ((user?.userType?.toUpperCase() !== 'INSTITUTEADMIN' && user?.userType?.toUpperCase() !== 'TEACHER') && 
        (user?.role?.toLowerCase() !== 'instituteadmin' && user?.role?.toLowerCase() !== 'teacher')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view submissions.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/payment-submissions?paymentId=${payment.id}&paymentTitle=${encodeURIComponent(payment.title)}`);
  };

  // Handle view my submissions for students
  const handleViewMySubmissions = () => {
    if (user?.userType !== 'Student') {
      toast({
        title: "Access Denied",
        description: "This feature is only available for students.",
        variant: "destructive"
      });
      return;
    }
    setSubmissionsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MANDATORY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'OPTIONAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Subject Payments
              </h1>
              {selectedSubject && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Subject: {selectedSubject.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={loadSubjectPayments}
              disabled={loading || !selectedInstitute || !selectedClass || !selectedSubject}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Loading...' : 'Load Payments'}</span>
            </Button>
            {((user?.userType?.toUpperCase() === 'INSTITUTEADMIN' || user?.userType?.toUpperCase() === 'TEACHER') || (user?.role?.toLowerCase() === 'instituteadmin' || user?.role?.toLowerCase() === 'teacher')) && selectedInstitute && selectedClass && selectedSubject && (
              <Button 
                onClick={() => setCreatePaymentDialogOpen(true)}
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Create Subject Payment</span>
              </Button>
            )}
            {user?.userType === 'Student' && selectedInstitute && selectedClass && selectedSubject && (
              <Button 
                onClick={handleViewMySubmissions}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>View My Submissions</span>
              </Button>
            )}
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments by ID, type, or description..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">All Status</Button>
                <Button variant="outline">Date Range</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selection Info Card */}
        {(selectedInstitute || selectedClass || selectedSubject) && (
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
                <BookOpen className="h-5 w-5" />
                <span>Current Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInstitute && (
                <p className="text-purple-800 dark:text-purple-200">
                  <strong>Institute:</strong> {selectedInstitute.name}
                </p>
              )}
              {selectedClass && (
                <p className="text-purple-800 dark:text-purple-200">
                  <strong>Class:</strong> {selectedClass.name}
                </p>
              )}
              {selectedSubject && (
                <p className="text-purple-800 dark:text-purple-200">
                  <strong>Subject:</strong> {selectedSubject.name}
                </p>
              )}
              {selectedSubject && (
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  {selectedSubject.description}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subject Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>
                {user?.role === 'Student' ? 'My Subject Payments' : 'Subject Payments'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!subjectPaymentsData ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  Click "Load Payments" to view data
                </p>
                <p className="text-gray-400 dark:text-gray-500">
                  Select institute, class, and subject first, then click Load Payments.
                </p>
              </div>
            ) : subjectPaymentsData.data.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  No payments found
                </p>
                <p className="text-gray-400 dark:text-gray-500">
                  Subject payments will appear here when created.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjectPaymentsData.data.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {payment.title}
                          </h3>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <Badge className={getPriorityColor(payment.priority)}>
                            {payment.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                          <strong>Target:</strong> {payment.targetType}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {payment.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          <strong>Due Date:</strong> {new Date(payment.lastDate).toLocaleDateString()}
                        </p>
                        {payment.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            <strong>Notes:</strong> {payment.notes}
                          </p>
                        )}
                        
                        {/* Submission Stats for Admins/Teachers */}
                        {(user?.role === 'InstituteAdmin' || user?.role === 'Teacher') && (
                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>Total: {payment.submissionsCount}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Verified: {payment.verifiedSubmissionsCount}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-yellow-600">
                              <Clock className="h-3 w-3" />
                              <span>Pending: {payment.pendingSubmissionsCount}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ₹{parseFloat(payment.amount).toLocaleString()}
                        </p>
                        
                        {/* Action Buttons based on user role */}
                        <div className="mt-2 space-y-1">
                          {user?.role === 'Student' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPaymentForSubmission(payment);
                                setSubmitPaymentDialogOpen(true);
                              }}
                            >
                              Submit Payment
                            </Button>
                          )}
                          
                          {((user?.userType?.toUpperCase() === 'INSTITUTEADMIN' || user?.userType?.toUpperCase() === 'TEACHER') || 
                            (user?.role?.toLowerCase() === 'instituteadmin' || user?.role?.toLowerCase() === 'teacher')) && (
                            <div className="space-y-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewSubmissions(payment)}
                                className="flex items-center space-x-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View Submissions</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {subjectPaymentsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Active Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {subjectPaymentsData.data.filter(p => p.status === 'ACTIVE').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{subjectPaymentsData.data
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mandatory Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {subjectPaymentsData.data.filter(p => p.priority === 'MANDATORY').length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verify Dialog for Institute Admins */}
        {selectedInstitute && user?.role === 'InstituteAdmin' && (
          <VerifySubmissionDialog
            open={verifyDialogOpen}
            onOpenChange={setVerifyDialogOpen}
            submission={selectedSubmission}
            instituteId={selectedInstitute.id}
            onSuccess={() => {
              setVerifyDialogOpen(false);
              setSelectedSubmission(null);
              loadSubjectPayments(); // Reload data after verification
            }}
          />
        )}

        {/* Student Submissions Dialog */}
        {user?.userType === 'Student' && selectedInstitute && selectedClass && selectedSubject && (
          <StudentSubmissionsDialog
            open={submissionsDialogOpen}
            onOpenChange={setSubmissionsDialogOpen}
            instituteId={selectedInstitute.id}
            classId={selectedClass.id}
            subjectId={selectedSubject.id}
          />
        )}

        {/* Create Subject Payment Dialog */}
        {((user?.userType?.toUpperCase() === 'INSTITUTEADMIN' || user?.userType?.toUpperCase() === 'TEACHER') || (user?.role?.toLowerCase() === 'instituteadmin' || user?.role?.toLowerCase() === 'teacher')) && selectedInstitute && selectedClass && selectedSubject && (
          <CreateSubjectPaymentForm
            open={createPaymentDialogOpen}
            onOpenChange={setCreatePaymentDialogOpen}
            instituteId={selectedInstitute.id}
            classId={selectedClass.id}
            subjectId={selectedSubject.id}
            onSuccess={loadSubjectPayments}
          />
        )}

        {/* Submit Payment Dialog for Students */}
        {user?.role === 'Student' && selectedPaymentForSubmission && (
          <SubmitSubjectPaymentDialog
            open={submitPaymentDialogOpen}
            onOpenChange={setSubmitPaymentDialogOpen}
            payment={selectedPaymentForSubmission}
            onSuccess={() => {
              setSubmitPaymentDialogOpen(false);
              setSelectedPaymentForSubmission(null);
              loadSubjectPayments();
            }}
          />
        )}

      </div>
    </AppLayout>
  );
};

export default SubjectPayments;
