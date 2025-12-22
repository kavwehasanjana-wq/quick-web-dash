import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageComponents";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DataTable, Column, PaginationMeta } from "@/components/shared/DataTable";
import { ViewDetailsDialog } from "@/components/shared/ViewDetailsDialog";
import { VerifySystemPaymentDialog } from "@/components/forms/VerifySystemPaymentDialog";

interface Payment {
  id: string;
  userId: string;
  paymentAmount: string;
  paymentMethod: string;
  paymentReference: string | null;
  paymentSlipUrl: string;
  paymentSlipFilename: string;
  status: string;
  paymentDate: string;
  paymentMonth: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function SystemPaymentPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [page, limit]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPayments(page, limit);
      setPayments(response.payments || []);
      setPagination({
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / (response.limit || limit)),
      });
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const handleVerify = (payment: Payment) => {
    setSelectedPayment(payment);
    setVerifyDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const columns: Column[] = [
    { key: "id", label: "ID" },
    { key: "userId", label: "User ID" },
    { key: "paymentAmount", label: "Amount", type: "currency" },
    { key: "paymentMethod", label: "Method", type: "badge" },
    { key: "paymentDate", label: "Payment Date", type: "date" },
    { key: "paymentMonth", label: "Month" },
    { key: "status", label: "Status", type: "badge" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="System Payment"
        description="Manage system-wide payment configurations"
        icon={CreditCard}
      />
      
      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        onView={handleView}
        onVerify={handleVerify}
        showViewSlip={true}
        slipUrlKey="paymentSlipUrl"
        pagination={pagination || undefined}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        data={selectedPayment}
        title={`Payment #${selectedPayment?.id || ""}`}
      />

      <VerifySystemPaymentDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        payment={selectedPayment}
        onSuccess={fetchPayments}
      />
    </DashboardLayout>
  );
}
