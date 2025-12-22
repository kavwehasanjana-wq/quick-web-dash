import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, ActionButton } from "@/components/shared/PageComponents";
import { Building2, UserPlus, Tag, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DataTable, Column, PaginationMeta } from "@/components/shared/DataTable";
import { ViewDetailsDialog } from "@/components/shared/ViewDetailsDialog";
import { CreateInstituteForm } from "@/components/forms/CreateInstituteForm";
import { AssignUserToInstituteForm } from "@/components/forms/AssignUserToInstituteForm";
import { CreateSenderMaskForm } from "@/components/forms/CreateSenderMaskForm";
import { ViewSenderMasksDialog } from "@/components/forms/ViewSenderMasksDialog";

interface Institute {
  id: string;
  name: string;
  shortName: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  district: string;
  province: string;
  pinCode: string;
  type: string;
  logoUrl: string;
  imageUrl: string;
  isActive: boolean;
  vision: string;
  mission: string;
  websiteUrl: string;
  facebookPageUrl: string;
  youtubeChannelUrl: string;
}

export default function InstitutePage() {
  const { toast } = useToast();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [createMaskDialogOpen, setCreateMaskDialogOpen] = useState(false);
  const [viewMasksDialogOpen, setViewMasksDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    fetchInstitutes();
  }, [page, limit]);

  const fetchInstitutes = async () => {
    try {
      setIsLoading(true);
      const response = await api.getInstitutes(page, limit);
      setInstitutes(response.data || []);
      if (response.meta) {
        setPagination({
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrev: response.meta.hasPrev,
        });
      }
    } catch (error) {
      console.error("Failed to fetch institutes:", error);
      toast({
        title: "Error",
        description: "Failed to load institutes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInstitute = () => {
    setCreateDialogOpen(true);
  };

  const handleAssignUser = (institute: Institute) => {
    setSelectedInstitute(institute);
    setAssignUserDialogOpen(true);
  };

  const handleCreateMask = (institute: Institute) => {
    setSelectedInstitute(institute);
    setCreateMaskDialogOpen(true);
  };

  const handleViewMasks = (institute: Institute) => {
    setSelectedInstitute(institute);
    setViewMasksDialogOpen(true);
  };

  const handleView = (institute: Institute) => {
    setSelectedInstitute(institute);
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
    { key: "imageUrl", label: "Image", type: "image" },
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "type", label: "Type", type: "badge" },
    {
      key: "assignUser",
      label: "Assign User",
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleAssignUser(row as Institute);
          }}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Assign
        </Button>
      ),
    },
    {
      key: "maskId",
      label: "MaskID",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateMask(row as Institute);
            }}
          >
            <Tag className="w-4 h-4 mr-1" />
            Mask
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleViewMasks(row as Institute);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Institute"
        description="Manage institutes and their configurations"
        icon={Building2}
        actions={
          <ActionButton label="Create Institute" onClick={handleCreateInstitute} />
        }
      />
      
      <DataTable
        columns={columns}
        data={institutes}
        isLoading={isLoading}
        onView={handleView}
        pagination={pagination || undefined}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        data={selectedInstitute}
        title={selectedInstitute?.name || "Institute Details"}
      />

      <CreateInstituteForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchInstitutes}
      />

      {selectedInstitute && (
        <>
          <AssignUserToInstituteForm
            open={assignUserDialogOpen}
            onOpenChange={setAssignUserDialogOpen}
            onSuccess={fetchInstitutes}
            instituteId={selectedInstitute.id}
            instituteName={selectedInstitute.name}
          />
          
          <CreateSenderMaskForm
            open={createMaskDialogOpen}
            onOpenChange={setCreateMaskDialogOpen}
            onSuccess={fetchInstitutes}
            instituteId={selectedInstitute.id}
            instituteName={selectedInstitute.name}
          />
          
          <ViewSenderMasksDialog
            open={viewMasksDialogOpen}
            onOpenChange={setViewMasksDialogOpen}
            instituteId={selectedInstitute.id}
            instituteName={selectedInstitute.name}
          />
        </>
      )}
    </DashboardLayout>
  );
}
