import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageComponents";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DataTable, Column, PaginationMeta } from "@/components/shared/DataTable";
import { ViewDetailsDialog } from "@/components/shared/ViewDetailsDialog";

interface SMSApproval {
  id: string;
  [key: string]: any;
}

export default function SMSPage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<SMSApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<SMSApproval | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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
      setApprovals(response.approvals || []);
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const columns: Column[] = [
    { key: "id", label: "ID" },
    { key: "instituteId", label: "Institute ID" },
    { key: "senderName", label: "Sender Name" },
    { key: "message", label: "Message" },
    { key: "recipientCount", label: "Recipients" },
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
        pagination={pagination || undefined}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        data={selectedApproval}
        title={`SMS Approval #${selectedApproval?.id || ""}`}
      />
    </DashboardLayout>
  );
}
