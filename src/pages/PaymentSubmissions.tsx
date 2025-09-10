import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { institutePaymentsApi, PaymentSubmissionsResponse, PaymentSubmission } from '@/api/institutePayments.api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import VerifySubmissionDialog from '@/components/forms/VerifySubmissionDialog';
import PaymentSubmissionsFilters, { FilterParams } from '@/components/PaymentSubmissionsFilters';
import PaymentSubmissionsPagination from '@/components/PaymentSubmissionsPagination';

const PaymentSubmissions = () => {
  const { selectedInstitute, user } = useAuth();
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { toast } = useToast();
  const [submissionsData, setSubmissionsData] = useState<PaymentSubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'submissionDate',
    sortOrder: 'DESC'
  });

  const loadSubmissions = async (appliedFilters = filters) => {
    if (!selectedInstitute || !paymentId) return;
    
    setLoading(true);
    try {
      const response = await institutePaymentsApi.getPaymentSubmissions(
        selectedInstitute.id, 
        paymentId, 
        appliedFilters
      );
      setSubmissionsData(response);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load payment submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount and filter changes
  useEffect(() => {
    loadSubmissions();
  }, [selectedInstitute, paymentId, filters]);

  const handleFiltersChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadSubmissions(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterParams = {
      page: 1,
      limit: 10,
      sortBy: 'submissionDate',
      sortOrder: 'DESC'
    };
    setFilters(clearedFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleVerifySubmission = (submission: PaymentSubmission) => {
    setSelectedSubmission(submission);
    setVerifyDialogOpen(true);
  };

  // Check if current user can verify submissions (only institute admins)
  const canVerifySubmissions = user?.userType === 'INSTITUTE_ADMIN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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
              <span>Back to Payments</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Payment Submissions</h1>
              <p className="text-muted-foreground mt-1">
                Payment ID: {paymentId}
              </p>
            </div>
          </div>
          <Button onClick={() => loadSubmissions()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Institute Info */}
        {selectedInstitute && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                <FileText className="h-5 w-5" />
                <span>Institute Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Institute:</strong> {selectedInstitute.name}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <PaymentSubmissionsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Payment Submissions</span>
                {submissionsData && (
                  <Badge variant="secondary">
                    {submissionsData.data.pagination.totalItems} total
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!submissionsData ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  Loading payment submissions...
                </p>
              </div>
            ) : submissionsData.data.submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  No submissions found
                </p>
                <p className="text-muted-foreground">
                  {Object.keys(filters).length > 2 ? 
                    'Try adjusting your filters to see more results.' : 
                    'No payment submissions have been made for this payment.'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {submissionsData.data.submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge className={`px-3 py-1 ${getStatusColor(submission.status)}`}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-2">{submission.status}</span>
                          </Badge>
                          <div>
                            <h3 className="font-semibold text-lg">
                              Submission #{submission.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              by {submission.submitterName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ₹{submission.paymentAmount.toLocaleString()}
                          </p>
                          {submission.status === 'PENDING' && canVerifySubmissions && (
                            <Button 
                              onClick={() => handleVerifySubmission(submission)}
                              size="sm"
                              className="mt-2"
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Payment Method:</span>
                            <span className="text-sm">{submission.paymentMethod}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Transaction Ref:</span>
                            <span className="text-sm font-mono">{submission.transactionReference}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Payment Date:</span>
                            <span className="text-sm">
                              {new Date(submission.paymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Submitted:</span>
                            <span className="text-sm">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {submission.verifiedAt && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Verified:</span>
                              <span className="text-sm">
                                {new Date(submission.verifiedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {submission.verifierName && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">Verified by:</span>
                              <span className="text-sm">{submission.verifierName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {submission.paymentRemarks && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Payment Remarks:</p>
                          <p className="text-sm">{submission.paymentRemarks}</p>
                        </div>
                      )}

                      {submission.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                          <p className="text-sm font-medium mb-1 text-red-800 dark:text-red-200">Rejection Reason:</p>
                          <p className="text-sm text-red-700 dark:text-red-300">{submission.rejectionReason}</p>
                        </div>
                      )}

                      {submission.notes && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <p className="text-sm font-medium mb-1">Admin Notes:</p>
                          <p className="text-sm">{submission.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <PaymentSubmissionsPagination
                  pagination={submissionsData.data.pagination}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Verify Dialog */}
        {selectedInstitute && (
          <VerifySubmissionDialog
            open={verifyDialogOpen}
            onOpenChange={setVerifyDialogOpen}
            submission={selectedSubmission}
            instituteId={selectedInstitute.id}
            onSuccess={() => loadSubmissions()}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default PaymentSubmissions;