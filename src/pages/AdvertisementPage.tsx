import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, ActionButton } from "@/components/shared/PageComponents";
import { DataTable, Column, PaginationMeta } from "@/components/shared/DataTable";
import { ViewDetailsDialog } from "@/components/shared/ViewDetailsDialog";
import { Megaphone } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateAdvertisementForm } from "@/components/forms/CreateAdvertisementForm";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Advertisement {
  id: string;
  title: string;
  accessKey: string;
  mediaUrl: string;
  [key: string]: any;
}

const columns: Column[] = [
  { key: "id", label: "ID", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "accessKey", label: "Access Key", type: "text" },
  { key: "mediaUrl", label: "Media URL", type: "image" },
];

export default function AdvertisementPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchAdvertisements = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await api.getAdvertisements(page, limit);
      setAdvertisements(response.advertisements || []);
      setPagination({
        page: response.currentPage || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        hasNextPage: response.currentPage < response.totalPages,
        hasPreviousPage: response.currentPage > 1,
      });
    } catch (error) {
      console.error("Failed to fetch advertisements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch advertisements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleCreateAdvertisement = () => {
    setCreateDialogOpen(true);
  };

  const handleView = (ad: Advertisement) => {
    setSelectedAd(ad);
    setViewDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchAdvertisements(page, pagination.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchAdvertisements(1, limit);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Advertisement"
        description="Manage advertisements and campaigns"
        icon={Megaphone}
        actions={
          <ActionButton label="Create Advertisement" onClick={handleCreateAdvertisement} />
        }
      />

      <DataTable
        columns={columns}
        data={advertisements}
        isLoading={loading}
        onView={handleView}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <CreateAdvertisementForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          fetchAdvertisements();
        }}
      />

      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        data={selectedAd}
        title={selectedAd?.title || "Advertisement Details"}
        imageKey="mediaUrl"
      />
    </DashboardLayout>
  );
}