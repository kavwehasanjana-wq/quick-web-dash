import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageComponents";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DataTable, Column, PaginationMeta } from "@/components/shared/DataTable";
import { ViewDetailsDialog } from "@/components/shared/ViewDetailsDialog";
import { VerifySMSApprovalDialog } from "@/components/forms/VerifySMSApprovalDialog";

interface SMSApproval {
  messageId: string;
  maskIdUsed?: string;
  instituteId?: string;
  instituteName?: string;
  senderName?: string;
  messageTemplate?: string;
  totalRecipients?: number;
  estimatedCredits?: number;
  status?: string;
  [key: string]: any;
}

export default function SMSPage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<SMSApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<SMSApproval | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, [page, limit]);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSMSApprovals(page, limit);
      // Map the data to include an `id` field for DataTable and `status` for verify button logic
      const mappedApprovals = (response.approvals || []).map((item: any) => ({
        ...item,
        id: item.messageId,
      }));
      setApprovals(mappedApprovals);
      setPagination({
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || limit)),
      });
    } catch (error) {
      console.error("Failed to fetch SMS approvals:", error);
      toast({
        title: "Error",
        description: "Failed to load SMS approvals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (approval: SMSApproval) => {
    setSelectedApproval(approval);
    setViewDialogOpen(true);
  };

  const handleVerify = (approval: SMSApproval) => {
    setSelectedApproval(approval);
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
    { key: "messageId", label: "Message ID" },
    { key: "maskIdUsed", label: "Sender ID" },
    { key: "instituteName", label: "Institute" },
    { key: "senderName", label: "Sender Name" },
    { key: "messageTemplate", label: "Message" },
    { key: "totalRecipients", label: "Recipients" },
    { key: "estimatedCredits", label: "Est. Credits" },
    { key: "status", label: "Status", type: "badge" },
    { key: "createdAt", label: "Created", type: "date" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="SMS"
        description="Manage SMS notifications and messaging"
        icon={MessageSquare}
      />
      
      <DataTable
        columns={columns}
        data={approvals}
        isLoading={isLoading}
        onView={handleView}
        onVerify={handleVerify}
        pagination={pagination || undefined}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        data={selectedApproval}
        title={`SMS Approval #${selectedApproval?.messageId || ""}`}
      />

      <VerifySMSApprovalDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        approval={selectedApproval}
        onSuccess={fetchApprovals}
      />
    </DashboardLayout>
  );
}
