import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  RefreshCw,
  Plus,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface PaymentRecord {
  id: string;
  userId: string;
  paymentAmount: string;
  paymentMethod: string;
  paymentReference: string;
  paymentSlipUrl: string | null;
  paymentSlipFilename: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  paymentDate: string;
  paymentMonth: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentApiResponse {
  payments: PaymentRecord[];
  total: number;
  page: number;
  limit: number;
}

const Payments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [apiResponse, setApiResponse] = useState<PaymentApiResponse | null>(null);

  // Load payment history from API
  const loadPaymentHistory = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No user ID available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/payment/my-payments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentApiResponse = await response.json();
      console.log('Payment API Response:', data);
      
      setApiResponse(data);
      setAllPayments(data.payments);
      filterPaymentsByTab('ALL', data.payments);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${data.payments.length} payment records.`
      });
    } catch (error) {
      console.error('Error loading payment history:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments by tab
  const filterPaymentsByTab = (tab: typeof activeTab, paymentsList = allPayments) => {
    let filtered = paymentsList;
    
    if (tab !== 'ALL') {
      filtered = paymentsList.filter(payment => payment.status === tab);
    }
    
    setPayments(filtered);
    setActiveTab(tab);
  };

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const handleDownloadSlip = (payment: PaymentRecord) => {
    if (payment.paymentSlipUrl) {
      // Open the payment slip URL in a new tab
      window.open(payment.paymentSlipUrl, '_blank');
      toast({
        title: "Opening Payment Slip",
        description: `Payment slip for ${payment.paymentReference} is being opened.`,
      });
    }
  };

  const handleNewPayment = () => {
    navigate('/payments/create');
  };

  return (
    <AppLayout currentPage="system-payment">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Payment History
            </h1>
            <p className="text-muted-foreground">
              View your payment transactions and download invoices
            </p>
          </div>
        </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(
                allPayments.filter(p => p.status === 'VERIFIED').reduce((sum, p) => sum + parseFloat(p.paymentAmount), 0).toString()
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allPayments.filter(p => p.status === 'VERIFIED').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {allPayments.filter(p => p.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allPayments.filter(p => p.status === 'REJECTED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handleNewPayment}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Payment
        </Button>
        
        <Button
          onClick={loadPaymentHistory}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Load Payments
        </Button>
      </div>

      {/* Payment Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => filterPaymentsByTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ALL">All ({allPayments.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({allPayments.filter(p => p.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="VERIFIED">Verified ({allPayments.filter(p => p.status === 'VERIFIED').length})</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected ({allPayments.filter(p => p.status === 'REJECTED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Payment List */}
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading payment history...</p>
            </div>
          ) : payments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {allPayments.length === 0 ? 'No payment history found. Click "Load Payments" to fetch data.' : `No ${activeTab.toLowerCase()} payments found`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <div>
                            <h3 className="font-semibold text-lg">
                              {formatAmount(payment.paymentAmount)}
                            </h3>
                            <p className="text-sm text-gray-600">{payment.notes}</p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Payment Date</div>
                              <div>{formatDate(payment.paymentDate)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Method</div>
                              <div>{payment.paymentMethod.replace('_', ' ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Reference</div>
                              <div className="font-mono text-xs">{payment.paymentReference}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Month</div>
                            <div>{payment.paymentMonth}</div>
                          </div>
                        </div>

                        {/* Additional Info for Rejected Payments */}
                        {payment.status === 'REJECTED' && payment.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="text-sm font-medium text-red-800">Rejection Reason:</div>
                            <div className="text-sm text-red-700">{payment.rejectionReason}</div>
                          </div>
                        )}

                        {/* Verification Info */}
                        {payment.status === 'VERIFIED' && payment.verifiedAt && (
                          <div className="mt-3 text-sm text-green-600">
                            Verified on {formatDate(payment.verifiedAt)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {payment.paymentSlipUrl && (
                          <Button
                            onClick={() => handleDownloadSlip(payment)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            View Slip
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
};

export default Payments;