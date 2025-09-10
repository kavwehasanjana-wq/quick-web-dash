import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckCircle, AlertCircle, Calendar, DollarSign, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { institutePaymentsApi, MySubmissionsResponse } from '@/api/institutePayments.api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MySubmissions = () => {
  const { selectedInstitute } = useAuth();
  const { toast } = useToast();
  const [submissionsData, setSubmissionsData] = useState<MySubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDING');

  const loadSubmissions = async () => {
    if (!selectedInstitute) return;
    
    setLoading(true);
    try {
      const response = await institutePaymentsApi.getMySubmissions(selectedInstitute.id);
      setSubmissionsData(response);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load your submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        return <Clock className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filterSubmissionsByStatus = (status: string) => {
    if (!submissionsData) return [];
    return submissionsData.data.submissions.filter(submission => submission.status === status);
  };

  const getTabIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderSubmissionCard = (submission: any) => (
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
              {submission.paymentType}
            </h3>
            <p className="text-sm text-muted-foreground">
              {submission.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">
            ₹{submission.paymentAmount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {submission.priority}
          </p>
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
            <span className="text-sm font-medium">Due Date:</span>
            <span className="text-sm">
              {new Date(submission.dueDate).toLocaleDateString()}
            </span>
          </div>
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

      {submission.receiptFileName && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm font-medium mb-1">Receipt File:</p>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{submission.receiptFileName}</span>
            {submission.receiptFileSize && (
              <span className="text-xs text-muted-foreground">
                ({(submission.receiptFileSize / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Submissions</h1>
            {selectedInstitute && (
              <p className="text-muted-foreground mt-1">
                Institute: {selectedInstitute.name}
              </p>
            )}
          </div>
          <Button onClick={loadSubmissions} disabled={loading}>
            {loading ? 'Loading...' : 'Load Submissions'}
          </Button>
        </div>

        {/* Summary Stats */}
        {submissionsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{submissionsData.data.summary.totalSubmissions}</p>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{submissionsData.data.summary.byStatus.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{submissionsData.data.summary.byStatus.verified}</p>
                    <p className="text-sm text-muted-foreground">Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{submissionsData.data.summary.byStatus.rejected}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submissions Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Payment Submissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!submissionsData ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  Click "Load Submissions" to view your payment submissions
                </p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="PENDING" className="flex items-center space-x-2">
                    {getTabIcon('PENDING')}
                    <span>Pending ({submissionsData.data.summary.byStatus.pending})</span>
                  </TabsTrigger>
                  <TabsTrigger value="VERIFIED" className="flex items-center space-x-2">
                    {getTabIcon('VERIFIED')}
                    <span>Verified ({submissionsData.data.summary.byStatus.verified})</span>
                  </TabsTrigger>
                  <TabsTrigger value="REJECTED" className="flex items-center space-x-2">
                    {getTabIcon('REJECTED')}
                    <span>Rejected ({submissionsData.data.summary.byStatus.rejected})</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="PENDING" className="mt-6">
                  <div className="space-y-4">
                    {filterSubmissionsByStatus('PENDING').length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No pending submissions</p>
                      </div>
                    ) : (
                      filterSubmissionsByStatus('PENDING').map(renderSubmissionCard)
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="VERIFIED" className="mt-6">
                  <div className="space-y-4">
                    {filterSubmissionsByStatus('VERIFIED').length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No verified submissions</p>
                      </div>
                    ) : (
                      filterSubmissionsByStatus('VERIFIED').map(renderSubmissionCard)
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="REJECTED" className="mt-6">
                  <div className="space-y-4">
                    {filterSubmissionsByStatus('REJECTED').length === 0 ? (
                      <div className="text-center py-8">
                        <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No rejected submissions</p>
                      </div>
                    ) : (
                      filterSubmissionsByStatus('REJECTED').map(renderSubmissionCard)
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MySubmissions;