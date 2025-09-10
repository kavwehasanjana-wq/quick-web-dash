import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowLeft, Download, Search, Eye, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { institutePaymentsApi, InstitutePaymentsResponse, StudentPaymentsResponse, InstitutePayment } from '@/api/institutePayments.api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import CreatePaymentDialog from '@/components/forms/CreatePaymentDialog';
import SubmitPaymentDialog from '@/components/forms/SubmitPaymentDialog';

const InstitutePayments = () => {
  const { selectedInstitute, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentsData, setPaymentsData] = useState<InstitutePaymentsResponse | StudentPaymentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<InstitutePayment | null>(null);

  const isInstituteAdmin = user?.userType === 'INSTITUTE_ADMIN';
  const isStudent = user?.userType === 'STUDENT';
  const isTeacher = user?.userType === 'TEACHER';

  const loadPayments = async () => {
    if (!selectedInstitute) return;
    
    setLoading(true);
    try {
      let response;
      if (isInstituteAdmin) {
        response = await institutePaymentsApi.getInstitutePayments(selectedInstitute.id);
      } else if (isStudent || isTeacher) {
        response = await institutePaymentsApi.getStudentPayments(selectedInstitute.id);
      }
      setPaymentsData(response);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = (payment: InstitutePayment) => {
    setSelectedPayment(payment);
    setSubmitDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MANDATORY':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300';
      case 'OPTIONAL':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
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
              <h1 className="text-3xl font-bold">
                Institute Payments
              </h1>
              {selectedInstitute && (
                <p className="text-muted-foreground mt-1">
                  Institute: {selectedInstitute.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isInstituteAdmin && (
              <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Payment</span>
              </Button>
            )}
            <Button onClick={loadPayments} disabled={loading}>
              {loading ? 'Loading...' : 'Load Payments'}
            </Button>
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

        {/* Institute Info Card */}
        {selectedInstitute && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                <CreditCard className="h-5 w-5" />
                <span>Current Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Institute:</strong> {selectedInstitute.name}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                <strong>User Type:</strong> {isInstituteAdmin ? 'Institute Admin' : isStudent ? 'Student' : isTeacher ? 'Teacher' : 'User'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!paymentsData ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  Click "Load Payments" to view payments
                </p>
                <p className="text-muted-foreground">
                  {isInstituteAdmin ? 'Institute payments will appear here.' : 'Your applicable payments will appear here.'}
                </p>
              </div>
            ) : paymentsData.data.payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  No payments found
                </p>
                <p className="text-muted-foreground">
                  {isInstituteAdmin ? 'No institute payments have been created yet.' : 'No payments are applicable to you at this time.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentsData.data.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {payment.paymentType}
                          </h3>
                          <Badge className={`px-2 py-1 ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </Badge>
                          <Badge className={`px-2 py-1 ${getPriorityColor(payment.priority)}`}>
                            {payment.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {payment.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p>
                            <strong>Due Date:</strong> {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Target:</strong> {payment.targetType}
                          </p>
                          {isInstituteAdmin && (
                            <>
                              <p>
                                <strong>Total Submissions:</strong> {payment.totalSubmissions}
                              </p>
                              <p>
                                <strong>Verified:</strong> {payment.verifiedSubmissions} | 
                                <strong> Pending:</strong> {payment.pendingSubmissions}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                        <div className="flex flex-col space-y-2 mt-2">
                          {isInstituteAdmin ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/payment-submissions/${payment.id}`)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Submissions</span>
                            </Button>
                          ) : (isStudent || isTeacher) ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSubmitPayment(payment)}
                              className="flex items-center space-x-1"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Submit Payment</span>
                            </Button>
                          ) : null}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{paymentsData ? paymentsData.data.payments
                  .filter(p => p.status === 'ACTIVE')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString() : '0'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isInstituteAdmin ? 'Total Submissions' : (isStudent || isTeacher) ? 'Pending Payments' : 'Total Amount'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {paymentsData ? (
                  isInstituteAdmin ? 
                    paymentsData.data.payments.reduce((sum, p) => sum + p.totalSubmissions, 0) :
                    (isStudent || isTeacher) && 'pendingPayments' in paymentsData.data ? 
                      paymentsData.data.pendingPayments :
                      paymentsData.data.payments.length
                ) : '0'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {paymentsData ? paymentsData.data.payments.length : '0'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        {selectedInstitute && (
          <>
            <CreatePaymentDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              instituteId={selectedInstitute.id}
              onSuccess={loadPayments}
            />
            <SubmitPaymentDialog
              open={submitDialogOpen}
              onOpenChange={setSubmitDialogOpen}
              payment={selectedPayment}
              instituteId={selectedInstitute.id}
              onSuccess={loadPayments}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default InstitutePayments;